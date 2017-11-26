import React, { Component } from 'react';
import {blue50, grey700} from 'material-ui/styles/colors';
import FlatButton from 'material-ui/FlatButton';
import Divider from 'material-ui/Divider';
import Dialog from 'material-ui/Dialog';
import TextField from 'material-ui/TextField';
import Snackbar from 'material-ui/Snackbar';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import 'whatwg-fetch';

import {
  Table,
  TableBody,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableRowColumn
} from 'material-ui/Table';
import { Card, CardHeader, CardText } from 'material-ui/Card';

const styles = {
	addrbook: {
		display: 'inline-block',
		width: '1000px',
		margin: '16px 32px 16px 0'
	},
	card: {
		marginBottom: '5px'
	},
	add: {
		float: 'right',
		marginTop: '-7px'
	},
	addrHeader: {
		padding: '12px',
    fontSize: '18px',
    color: grey700,
    borderRadius: '2px',
    backgroundColor: blue50,
    marginBottom: '5px',
    boxShadow: 'rgba(0, 0, 0, 0.117647) 0px 1px 6px, rgba(0, 0, 0, 0.117647) 0px 1px 4px'
	},
	dialog: {
		width: '306px',
  	maxWidth: 'none'
	}
}

export default class Category extends Component {
	constructor(props) {
		super(props);
		this.state = {
			mail:[],
			open: false,
			snackOpen: false,
			message: '',
			tags:[],
			selectTag: "",
			deleteValue: ""
		};
		this.handleChange = (event, index, value) => this.setState({deleteValue: value, snackOpen: false});
	}

	onClick() {
		this.self.deleteMail(this.id);
	}

	deleteMail(id) {
		fetch(`/api/mail/delete?mid=${id}`,{
			method: 'DELETE',
			credentials: 'include'
		}).then((response) => (
				response.json()
			)).then((json) => {
				if(json.status!==200) {
					alert(json.errInfo);
					return;
				}
				this.refreshMail();
			}).catch((ex) => {
    		console.log('解析错误', ex)
  		})
	}

	toggleDialog() {
		let state = {
			open: !this.state.open
		};

		if(!this.state.open){
			state.snackOpen = false;
		}

		this.setState(state);
	}

	addCategory() {
		fetch('/api/tag/save', {
				method: 'POST',
	      headers: {
	        'Content-Type': 'application/json'
	      },
	      body: JSON.stringify({ name: this.refs.tagName.input.value}),
				credentials: 'include'
			}).then((res) => {
				return res.json();
			}).then((result) => {
				if(!result.err){
	        this.setState({snackOpen: true, message: result.message});
	        this.toggleDialog();
	        this.refreshMail();
	        this.fetchTag();
	      } else {
	        this.setState({snackOpen: true, message: result.errInfo});
	      }

			}).catch((e) => {
				console.log('解析失败', e);
			})
	}

	fetchTag() {
		fetch('/api/tag/list', {
			method: 'GET',
			credentials: 'include'
		}).then((res) => {
			return res.json();
		}).then((data) => {
			let selectTag = data.result.tags.map((tag) => (
			      <MenuItem
			        key={tag._id}
			        value={tag._id}
			        primaryText={tag.name}
			      />
		    	));
			this.setState({ tags: data.result.tags, selectTag: selectTag});
		}).catch((e) => {
			console.log('解析失败', e);
		});
	}
	
	deleteTag() {
		fetch(`/api/tag/delete?tagId=${this.state.deleteValue}`,{
			method: 'DELETE',
			credentials: 'include'
		}).then((response) => (
				response.json()
			)).then((json) => {
				if(json.status!==200) {
					console.log(json.errInfo);
					return;
				}
				this.refreshMail();
				this.fetchTag();
			}).catch((ex) => {
    		console.log('解析错误', ex)
  		})
	}

	componentDidMount() {
		this.refreshMail();
		this.fetchTag();
	}

	refreshMail() {
		fetch('/api/mail/category',{
			method: 'GET',
			credentials: 'include'
		}).then((response) => (
				response.json()
			)).then((json) => {
				let mail = json.mails.map((group) => (
						<Card style={styles.card} key={group.name}>
							<CardHeader
			          title={group.name}
			          actAsExpander={true}
			          showExpandableButton={true}
			        />
			        <Divider />
			        <CardText expandable={true}>
								<Table>
							    <TableHeader
							    	displaySelectAll={false}
							    	adjustForCheckbox={false}>
							      <TableRow>
							        <TableHeaderColumn>发件人</TableHeaderColumn>
							        <TableHeaderColumn>主题</TableHeaderColumn>
							        <TableHeaderColumn>时间</TableHeaderColumn>
							        <TableHeaderColumn>操作</TableHeaderColumn>
							      </TableRow>
							    </TableHeader>
							    <TableBody
							    	displayRowCheckbox={false}
							    	showRowHover={true}>
							      { group.mails.map((mail) => (
								      	<TableRow key={mail._id}>
													<TableRowColumn>{mail.sender}</TableRowColumn>
													<TableRowColumn>{mail.title}</TableRowColumn>
													<TableRowColumn>{mail.updateTime.split('T')[0]}</TableRowColumn>
													<TableRowColumn><FlatButton label="删除" secondary={true} onTouchTap={this.onClick.bind({self:this,id:mail._id})}/></TableRowColumn>
												</TableRow>
							      ))}
							    </TableBody>
							  </Table>
						  </CardText>
					  </Card>
					));
				this.setState({mail: mail});
			}).catch((ex) => {
    		console.log('解析错误', ex)
  		});
	}
	render() {

		const actions = [
      <FlatButton
        label="返回"
        secondary={true}
        onTouchTap={this.toggleDialog.bind(this)}
      />,
      <FlatButton
        label="提交"
        primary={true}
        onTouchTap={this.addCategory.bind(this)}
      />
    ];

		return (
			<div  style={styles.addrbook}>
				<div style={styles.addrHeader}>
					<span>分类邮件</span>
					<FlatButton style={styles.add} label="添加分类" secondary={true} onTouchTap={this.toggleDialog.bind(this)} />
					<FlatButton style={styles.add} label="删除分类" secondary={true} onTouchTap={this.deleteTag.bind(this)} />
					<SelectField
		        hintText="选择分类"
		        value={this.state.deleteValue}
		        onChange={this.handleChange}
		        style={{float:"right",marginTop:"-10px"}}
		      >
						{this.state.selectTag}
					</SelectField>
				</div>
				{this.state.mail}
				<Dialog
          title="添加分类"
          actions={actions}
          modal={false}
          open={this.state.open}
          contentStyle={styles.dialog}
          onRequestClose={this.toggleDialog.bind(this)}
        >
	        <TextField ref="tagName" hintText="分类名"/><br/>
        </Dialog>
        <Snackbar
          open={this.state.snackOpen}
          message={this.state.message}
          autoHideDuration={2000}
        />
			</div>
		);
	}
}

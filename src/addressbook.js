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

export default class AddressBook extends Component {
	constructor(props) {
		super(props);
		this.state = {
			addressBook:[],
			open: false,
			open2: false,
			snackOpen: false,
			message: '',
			groups: [],
			values:[],
			deleteValue: null,
			selectGroup: []
		};
		this.handleChange = (event, index, values) => this.setState({values: values, snackOpen: false});
		this.handleChange2 = (event, index, value) => this.setState({deleteValue: value, snackOpen: false});
	}

	toggleDialog() {
		this.fetchGroup();
		let state = {
			open: !this.state.open
		};

		if(!this.state.open){
			state.snackOpen = false;
		}

		this.setState(state);
	}

	toggleDialog2() {
		let state = {
			open2: !this.state.open2
		};

		if(!this.state.open2){
			state.snackOpen = false;
		}

		this.setState(state);
	}

	addContact() {
		let formData = {
			name: this.refs.usrName.input.value,
			mailAddress: this.refs.usrMail.input.value,
			remark: this.refs.remarks.input.value,
			groups: this.state.values
		};

		fetch('/api/contact/save', {
			method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
			credentials: 'include',
      body: JSON.stringify(formData)
		}).then((res) => {
			return res.json();
		}).then((result) => {
			if(!result.err){
        this.setState({snackOpen: true, message: result.message});
        this.toggleDialog();
        this.refreshContact();
      } else {
        this.setState({snackOpen: true, message: result.errInfo});
      }

		}).catch((e) => {
			console.log('解析失败', e);
		})
	}

	onClick() {
		this.self.deleteContact(this.id);
	}

	deleteContact(id) {
		fetch(`/api/contact/delete?addressBookId=${id}`,{
			method: 'DELETE',
			credentials: 'include'
		}).then((response) => (
				response.json()
			)).then((json) => {
				if(json.status!==200) {
					console.log(json.errInfo);
					return;
				}
				this.refreshContact();
			}).catch((ex) => {
    		console.log('解析错误', ex)
  		})

	}

	addGroup() {
		fetch('/api/group/save', {
				method: 'POST',
	      headers: {
	        'Content-Type': 'application/json'
	      },
	      body: JSON.stringify({ name: this.refs.groupName.input.value}),
				credentials: 'include'
			}).then((res) => {
				return res.json();
			}).then((result) => {
				if(!result.err){
	        this.setState({snackOpen: true, message: result.message});
	        this.toggleDialog2();
	        this.refreshContact();
	        this.fetchGroup();
	      } else {
	        this.setState({snackOpen: true, message: result.errInfo});
	      }

			}).catch((e) => {
				console.log('解析失败', e);
			})
	}

	deleteGroup() {
		console.log(this.state.deletValue);
		fetch(`api/group/delete?groupId=${this.state.deleteValue}`, {
			method: 'DELETE',
			credentials: 'include'
		}).then((res) => {
			return res.json();
		}).then((data) => {
			console.log(data);
			this.refreshContact();
			this.fetchGroup();
		}).catch((e) => {
			console.log('解析失败', e);
		});
	}

	componentDidMount() {
		this.refreshContact();
		this.fetchGroup();
	}
	
	fetchGroup(value) {
		fetch('/api/group/list', {
			method: 'GET',
			credentials: 'include'
		}).then((res) => {
			return res.json();
		}).then((data) => {
			let selectGroup = data.result.groups.map((group) => (
			      <MenuItem
			        key={group._id}
			        value={group._id}
			        primaryText={group.name}
			      />
		    	));
			this.setState({ groups: data.result.groups, selectGroup: selectGroup});
		}).catch((e) => {
			console.log('解析失败', e);
		});
	}

	refreshContact() {
		fetch('/api/contact/list',{
			method: 'GET',
			credentials: 'include'
		}).then((response) => (
				response.json()
			)).then((json) => {
				let addressBook = json.result.addressBooks.map((group) => (
						<Card style={styles.card} key={group._id}>
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
							    	adjustForCheckbox={false}
							    	>
							      <TableRow>
							        <TableHeaderColumn>联系人名称</TableHeaderColumn>
							        <TableHeaderColumn>备注</TableHeaderColumn>
							        <TableHeaderColumn>邮箱</TableHeaderColumn>
							      	<TableHeaderColumn>操作</TableHeaderColumn>
							      </TableRow>
							    </TableHeader>
							    <TableBody 
							    	displayRowCheckbox={false}
							    	showRowHover={true}>
							      { group.contactors.map((contactor) => (
								      	<TableRow key={contactor._id}>
													<TableRowColumn>{contactor.name}</TableRowColumn>
													<TableRowColumn>{contactor.remark}</TableRowColumn>
													<TableRowColumn>{contactor.mailAddress}</TableRowColumn>
													<TableRowColumn><FlatButton label="删除" secondary={true} onTouchTap={this.onClick.bind({self:this,id:contactor._id})}/></TableRowColumn>
												</TableRow>
							      ))}
							    </TableBody>
							  </Table>
						  </CardText>
					  </Card>
					));
				this.setState({addressBook: addressBook});
			}).catch((ex) => {
    		console.log('解析错误', ex)
  		});
	}
	render() {

		const actions = {
			one:[
	      <FlatButton
	        label="返回"
	        secondary={true}
	        onTouchTap={this.toggleDialog.bind(this)}
	      />,
	      <FlatButton
	        label="提交"
	        primary={true}
	        onTouchTap={this.addContact.bind(this)}
	      />
	    ],
	    two:[
	      <FlatButton
	        label="返回"
	        secondary={true}
	        onTouchTap={this.toggleDialog2.bind(this)}
	      />,
	      <FlatButton
	        label="提交"
	        primary={true}
	        onTouchTap={this.addGroup.bind(this)}
	      />
    ]};

		return (
			<div  style={styles.addrbook}>
				<div style={styles.addrHeader}>
					<span>通讯录</span>
					<FlatButton style={styles.add} label="添加联系人" secondary={true} onTouchTap={this.toggleDialog.bind(this)} />
					<FlatButton style={styles.add} label="创建分组" secondary={true} onTouchTap={this.toggleDialog2.bind(this)} />
					<FlatButton style={styles.add} label="删除分组" secondary={true} onTouchTap={this.deleteGroup.bind(this)} /> 
					<SelectField
		        hintText="选择分组"
		        value={this.state.deleteValue}
		        onChange={this.handleChange2}
		        style={{float:"right",marginTop:"-10px"}}
		      >
						{this.state.selectGroup}
					</SelectField>
				</div>
				{this.state.addressBook}
				<Dialog
          title="添加联系人"
          actions={actions.one}
          modal={false}
          open={this.state.open}
          contentStyle={styles.dialog}
          onRequestClose={this.toggleDialog.bind(this)}
        >
	        <TextField ref="usrName" hintText="用户名"/><br/>
	        <TextField ref="usrMail" hintText="邮箱"/><br/>
					<TextField ref="remarks" hintText="备注"/><br/>
					<SelectField
		        multiple={true}
		        hintText="选择分组"
		        value={this.state.values}
		        onChange={this.handleChange}
		      >
		        {this.state.groups.map((group) => (
				      <MenuItem
				        key={group._id}
				        insetChildren={true}
				        checked={this.state.values && this.state.values.indexOf(group.name) > -1}
				        value={group.name}
				        primaryText={group.name}
				      />
				    ))}
		      </SelectField>
        </Dialog>
        <Dialog
          title="创建分组"
          actions={actions.two}
          modal={false}
          open={this.state.open2}
          contentStyle={styles.dialog}
          onRequestClose={this.toggleDialog2.bind(this)}
        >
	        <TextField ref="groupName" hintText="分组名"/><br/>
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

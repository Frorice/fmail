import React, { Component } from 'react';
import createHistory from 'history/createHashHistory';
import Paper from 'material-ui/Paper';
import {blue50, grey700} from 'material-ui/styles/colors';
import FlatButton from 'material-ui/FlatButton';
import 'whatwg-fetch';

import {
  Table,
  TableBody,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableRowColumn,
} from 'material-ui/Table';

const styles = {
	paper: {
		display: 'inline-block',
		width: '1000px',
		margin: '16px 32px 16px 0'
	},
	paperHeader: {
    padding: '12px',
    fontSize: '18px',
    color: grey700,
    borderTopLeftRadius: '2px',
    borderTopRightRadius: '2px',
    backgroundColor: blue50
	}
}

const history = createHistory();
const tagList = ['', '收件箱', '已发邮件', '草稿箱'];
const urlList = ['', '/maildetail', '/maildetail', '/editmail'];
let type;//邮件类型
let mails;

export default class MailList extends Component {

	constructor(props) {
		super(props);
		this.state = {
			mails:[]
		};
	}

	componentDidMount() {
		this.refreshList(this.props);
	}

	componentWillReceiveProps(props) {
		this.refreshList(props);
	}

	refreshList(props) {
		type = props.location.pathname.match(/\d/)[0];

		fetch(`/api/mail/list?type=${type}`,{
			method: 'GET',
			credentials: 'include'
		}).then((response) => (
				response.json()
			)).then((json) => {
				let title = tagList[type];

				if(json.status!==200) {
					console.log(json.errInfo);
					this.setState({mails: [], title: title});
					return;
				}
				
				this.setState({ mails: json.mails, title: title });
			}).catch((ex) => {
    		console.log('解析错误', ex)
  		})
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
				this.refreshList(this.props);
			}).catch((ex) => {
    		console.log('解析错误', ex)
  		})
	}

	onCellClick(rowNumber, colNumber) {
		if(colNumber!=4){
			history.push(`${urlList[type]}?mid=${this.state.mails[rowNumber].id}`);
		}
		if(colNumber==4){
			this.deleteMail(this.state.mails[rowNumber].id);
		}
	}

	render() {
		return (
			<Paper style={styles.paper}>
				<div style={styles.paperHeader}><span>{this.state.title}</span></div>
				<Table 
					onCellClick={this.onCellClick.bind(this)}
				>
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
			    	showRowHover={true} 
			    	displayRowCheckbox={false}>
			      { this.state.mails.reverse().map((mailNote) => (
								<TableRow key={mailNote.id}>
									<TableRowColumn>{mailNote.sender}</TableRowColumn>
									<TableRowColumn>{mailNote.title}</TableRowColumn>
									<TableRowColumn>{`${mailNote.date.split('T')[0]} ${mailNote.date.split('T')[1].split('.')[0]}`}</TableRowColumn>
									<TableRowColumn><FlatButton label="删除" secondary={true} /></TableRowColumn>
								</TableRow>
							))
					 	}
			    </TableBody>
			  </Table>
			 </Paper>
		);
	}
}

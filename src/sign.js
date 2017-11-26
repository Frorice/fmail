import React, { Component } from 'react';

import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';
import Paper from 'material-ui/Paper';
import Dialog from 'material-ui/Dialog';
import Snackbar from 'material-ui/Snackbar';

import 'whatwg-fetch';

const styles = {
	login: {
		position: 'absolute',
		width:'276px',
		padding: '5px 10px 10px 10px',
		top: '40%',
		left: '50%',
		transform: 'translate(-50%,-50%)',
	},
	signup: {
		float: 'right',
		marginTop: '10px'
	},
	logTitle: {
		textAlign: 'center'
	},
	logBtn: {
		width:'256px',
		marginTop:'10px'
	},
	dialog: {
		width: '306px',
  	maxWidth: 'none'
	}
};

export default class Sign extends Component {
	constructor(props) {
		super(props);
		this.state = {
			open: false,
			snackOpen: false,
			message: ""
		}
	}

	toggleDialog() {
		this.setState({open: !this.state.open});
	}

	login() {
		let refs = this.refs;
		let formData = {
			mailAddress: refs.logMail.input.value,
			pwd: refs.logPass.input.value
		};

		for( let ref in refs) {
			if( refs.hasOwnProperty(ref) && !refs[ref].input.value && !~ref.indexOf('reg') && !~ref.indexOf('rep')) {
				refs[ref].setState({errorText:"输入不能为空！"});
				return;
			} else {
				refs[ref].setState({errorText:""});
			}
		}

		fetch('api/user/signin', {
			method: 'POST',
			headers: {
    		'Content-Type': 'application/json'
  		},
  		credentials: 'include',
			body: JSON.stringify(formData)
		}).then((res) => {
			return res.json();
		}).then((result) => {
			if(result.sign){
				this.props.onLogin();
				this.toggleDialog();
			} else {
				this.setState({snackOpen: true, message: result.errInfo});
			}
		}).catch(function(ex) {
    	console.log('解析失败', ex);
  	})
	}

	register() {
		let refs = this.refs;
		let formData = {
			mailAddress: refs.regMail.input.value,
			userName: refs.regName.input.value,
			pwd: refs.regPass.input.value
		}

		for( let ref in refs) {
			if( refs.hasOwnProperty(ref) && !refs[ref].input.value && !~ref.indexOf('log')) {
				refs[ref].setState({errorText:"输入不能为空！"});
				return;
			} else {
				refs[ref].setState({errorText:""});
			}
		}

		if(formData.pwd.length<6){
			refs.regPass.setState({errorText: "密码长度不得少于六位！"});
			return;
		}

		if(formData.pwd != refs.repPass.input.value){
			refs.repPass.setState({errorText: "两次输入的密码不一致！"});
			return;
		}

		fetch('api/user/signup', {
			method: 'POST',
			headers: {
    		'Content-Type': 'application/json'
  		},
  		credentials: 'include',
			body: JSON.stringify(formData)
		}).then((res) => {
			return res.json();
		}).then((result) => {
			if(result.sign){
				this.setState({snackOpen: true, message: '注册成功，请登录！'});
				this.toggleDialog();
			} else {
				this.setState({snackOpen: true, message: result.errInfo});
			}
		}).catch(function(ex) {
    	console.log('解析失败', ex);
  	})
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
        onTouchTap={this.register.bind(this)}
      />,
    ];

		return (<div>
			<Paper style={styles.login}>
				<h1 style={styles.logTitle}>Fmail</h1>
				<TextField ref="logMail" hintText="邮箱"/><br/>
				<TextField type="password" ref="logPass" hintText="密码"/><br/>
				<RaisedButton label="登录" primary={true} style={styles.logBtn} onTouchTap={this.login.bind(this)} />
				<FlatButton label="注册账号" secondary={true} style={styles.signup} onTouchTap={this.toggleDialog.bind(this)} />
			</Paper>
			 <Dialog
          title="注册账号"
          actions={actions}
          modal={true}
          open={this.state.open}
          contentStyle={styles.dialog}
          onRequestClose={this.toggleDialog.bind(this)}
        >
	        <TextField ref="regName" hintText="用户名"/><br/>
	        <TextField ref="regMail" hintText="邮箱"/><br/>
					<TextField type="password" ref="regPass" hintText="密码"/><br/>
					<TextField type="password" ref="repPass" hintText="重复密码"/>
        </Dialog>
        <Snackbar
          open={this.state.snackOpen}
          message={this.state.message}
          autoHideDuration={2000}
        />
		</div>)
	}
}
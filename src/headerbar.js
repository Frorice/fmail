import React, { Component } from 'react';
import AppBar from 'material-ui/AppBar';
import FlatButton from 'material-ui/FlatButton';
import FontIcon from 'material-ui/FontIcon';
import {blue50} from 'material-ui/styles/colors';
import IconButton from 'material-ui/IconButton';
import Avatar from 'material-ui/Avatar';
import Popover from 'material-ui/Popover';
import RaisedButton from 'material-ui/RaisedButton';

const styles = {
	appbar: {
		backgroundColor: blue50
	},
	title: {
		color: 'black'
	},
	avt: {
		padding: 0
	},
	popover: {
		padding: '10px'
	},
	popavt: {
		display: 'inline-block',
		margin: '0 16px 16px 0'
	},
	popinfo: {
		display: 'inline-block',
		verticalAlign: 'top'
	}
};

export default class HeaderBar extends Component {
	constructor(props) {
		super(props);
		this.state = {
			logged: false,
			open:false
		}
	}

	handleTouchTap(event) {
		event.preventDefault();
    this.setState({
      open: true,
      anchorEl: event.currentTarget,
    });
	}

	handleRequestClose() {
		this.setState({
      open: false,
    });
	}

	logout() {
		fetch('/api/user/signOut',{
			method: 'GET',
			credentials: 'include'
		}).then((res) => {
			return res.json();
		}).then((json) => {
			location.href="http://localhost:3000";
		}).catch((e) => {
			console.log(e);
		});
	}

	render() {
		return (<AppBar 
		  title="Fmail"
		  titleStyle={styles.title}
		  iconElementLeft={<FontIcon
	      className="muidocs-icon-communication-email"
	    />}
			iconElementRight={
				this.logged
				? <FlatButton label="登录" />
				: (<div>
						<IconButton 
							onTouchTap={this.handleTouchTap.bind(this)} 
							style={styles.avt}>
							<Avatar src="http://img3.3lian.com/2013/v12/86/103.jpg" />
						</IconButton>
						<Popover
		          open={this.state.open}
		          anchorEl={this.state.anchorEl}
		          anchorOrigin={{horizontal: 'right', vertical: 'bottom'}}
		          targetOrigin={{horizontal: 'right', vertical: 'top'}}
		          onRequestClose={this.handleRequestClose.bind(this)}
		          style={styles.popover}
		        >
		        <RaisedButton label="退出" secondary={true} fullWidth={true} onTouchTap={this.logout.bind(this)}/>
		        </Popover>
					</div>)
			}
			style={styles.appbar}
		/>);
	}
}
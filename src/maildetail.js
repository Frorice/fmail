import React, { Component } from 'react';
import 'whatwg-fetch';

import createHistory from 'history/createHashHistory';
import { Card, CardActions, CardHeader, CardTitle, CardText } from 'material-ui/Card';
import FlatButton from 'material-ui/FlatButton';
import Chip from 'material-ui/Chip';
import Divider from 'material-ui/Divider';
import MailTools from './mailtools.js';
import AttachFile from 'material-ui/svg-icons/editor/attach-file';

const styles = {
	 chip: {
    margin: 4,
  },
  wrapper: {
  	padding: '0 16px',
    display: 'flex',
    flexWrap: 'wrap',
  },
  card: {
  	display: 'inline-block',
  	width: '1000px',
  	margin: '16px 32px 16px 0',
  	paddingBottom: "16px"
  },
  content: {
  	padding: '16px',
  },
  text: {
  	backgroundColor:"aliceblue"
  },
  attachment: {
  	marginTop:'16px'
  }
}
const history = createHistory();

export default class MailDetail extends Component {
	constructor(props) {
		super(props);
		this.state = { mail: {}};
	}

	componentDidMount() {
		this.refresh();
	}

	response() {
		history.push(`/editmail?mid=${this.state.mail._id}`);
	}

	attachment() {
		if(this.state.mail.attachment && this.state.mail.attachment.length){
			return (<div style={styles.attachment}>
				<span style={{marginRight: "1em"}}><AttachFile style={{float: "left"}}/>附件：{this.state.mail.attachment.name}</span>
				<a download={this.state.mail.attachment.name} href={`attachments${this.state.mail.attachment.path}`}>下载</a>
			</div>)
		}
	}

	refresh() {
		let query = location.hash.split("?")[1];
		fetch(`/api/mail/detail?${query}`,{
			method: 'GET',
			credentials: 'include'
		}).then((res) => (
			res.json()
		)).then((json) => {
			this.setState({mail: json.result.mail});
		}).catch((ex) => {
			console.log(ex);
		})
	}

	render() {	
		return (
			<Card style={styles.card} >
				<MailTools refresh={this.refresh.bind(this)}/>
				<CardHeader
					title= {this.state.mail.sender}
					subtitle= {`${this.state.mail.remark||''} 发送至 ${this.state.mail.recipient}`}
					avatar= {this.state.mail.senderAvatar}
				/>
				<Divider/>
				<CardTitle title={this.state.mail.title} />
				<div style={styles.wrapper}>{
					this.state.mail.tags && this.state.mail.tags.map((tag, i) => (
						<Chip 
							key= {i}
          		style={styles.chip}>
		          {tag}
			      </Chip>
					))
				}</div>
				<div style={styles.content}>
					<CardText style={styles.text} dangerouslySetInnerHTML={{__html: this.state.mail.content}}></CardText>
					{this.attachment()}
				</div>
				{
					(() => {
						if(this.state.mail.type!==2)
						return (<CardActions>
							<FlatButton label="回复" primary={true} onTouchTap={this.response.bind(this)}/>
						</CardActions>)
					})()
				}
			</Card>
		)
	}
}
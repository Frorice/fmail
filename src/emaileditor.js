import React, { Component } from 'react';
import Paper from 'material-ui/Paper';
import createHistory from 'history/createHashHistory';
import TextField from 'material-ui/TextField';
import Divider from 'material-ui/Divider';
import {Editor, EditorState, RichUtils, convertFromHTML, ContentState} from 'draft-js';
import {stateToHTML} from 'draft-js-export-html';
import RaisedButton from 'material-ui/RaisedButton';
import IconButton from 'material-ui/IconButton';
import AttachFile from 'material-ui/svg-icons/editor/attach-file';
import {blueGrey500} from 'material-ui/styles/colors';
import Snackbar from 'material-ui/Snackbar';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';

const history = createHistory();

const styles = {
	paper: {
		display: 'inline-block',
		width: '1000px',
		margin: '16px 32px 16px 0'
	},
	paperHeader: {
    padding: '12px',
    fontSize: '18px',
    color: 'white',
    borderTopLeftRadius: '2px',
    borderTopRightRadius: '2px',
    backgroundColor: blueGrey500
	},
	textField: {
		marginLeft: '20px'
	},
	raiseButton: {
		margin: '10px 0 10px 20px'
	},
	attachFile: {
		margin: '10px 20px 10px 0',
		float: 'right'
	},
  dialog: {
    width: '306px',
    maxWidth: 'none'
  }
}
const attachFile = new FormData();

export default class EmailEditor extends Component {
	constructor(props) {
		super(props);
	  this.state = {
      editorState: EditorState.createEmpty(),
      snackOpen: false,
      open: false,
      message: "",
      rec:"",
      title: "",
      recHint: "收件人",
      titleHint: "主题"
    };
    this.focus = () => this.refs.editor.focus();
    this.onChange = (editorState) => {
    	this.setState({editorState: editorState, snackOpen: false});
    };
    this.handleKeyCommand = (command) => this._handleKeyCommand(command);
    this.onTab = (e) => this._onTab(e);
    this.toggleBlockType = (type) => this._toggleBlockType(type);
    this.toggleInlineStyle = (style) => this._toggleInlineStyle(style);
    this.recChange = (e) => { 
      this.setState({
        rec: e.target.value,
        recHint:""
      });
    }
    this.tleChange = (e) => {
      this.setState({
        title: e.target.value,
        titleHint: ""
      });
    }
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

  attach(e){
    attachFile.set('file', this.refs.file.files[0]);
    this.toggleDialog();
  }

  componentDidMount() {
    let mid = location.hash.split("?")[1].split("=")[1];
    if(mid&&mid!="new"){
      fetch(`/api/mail/detail?mid=${mid}`,{
        method: 'GET',
        credentials: 'include'
      }).then((res) => {
        return res.json();
      }).then((json) => {
        
        if(json.result.mail.type!=1){
          let blocksFromHTML = convertFromHTML(json.result.mail.content);
          let state = ContentState.createFromBlockArray(
            blocksFromHTML.contentBlocks,
            blocksFromHTML.entityMap,
          );
          this.setState({
            editorState: EditorState.createWithContent(state),
            title: json.result.mail.title,
            rec: json.result.mail.recipient,
            recHint:"",
            titleHint:""
          });
        } else {
          let blocksFromHTML = convertFromHTML("原邮件内容：<br/>"+json.result.mail.content);
          let state = ContentState.createFromBlockArray(
            blocksFromHTML.contentBlocks,
            blocksFromHTML.entityMap,
          );
          this.setState({
            editorState: EditorState.createWithContent(state),
            title: "回复邮件："+json.result.mail.title,
            rec: json.result.mail.sender,
            recHint:"",
            titleHint:""
          });
        }
        
      }).catch((e) => {
        console.log("解析失败", e);
      })
      
    }
  }

  saveMail(e) {
    let actionType = 3;//保存
    if(e.target.innerText == "发送"){
      actionType = 2;//发送
    } 

    let data = {
      mid: location.hash.split("?")[1].split("=")[1],
      actionType: actionType,
      mail:{
        recipient: this.state.rec,
        title: this.state.title,
        content: stateToHTML(this.state.editorState.getCurrentContent())
      }
    };
    attachFile.set('data', JSON.stringify(data));
    fetch('/api/mail/save', {
      method: 'POST',
      credentials: 'include',
      body: attachFile
    }).then((res) => {
      return res.json();
    }).then((result) => {
      if(!result.err){
        this.setState({snackOpen: true, message: result.message});
        setTimeout(() => {history.push(`/maillist/${actionType}`)},2200);
      } else {
        this.setState({snackOpen: true, message: result.errInfo});
      }
    }).catch(function(ex) {
      console.log('解析失败', ex);
    });
  }

	_handleKeyCommand(command) {
    const {editorState} = this.state;
    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      this.onChange(newState);
      return true;
    }
    return false;
  }

  _onTab(e) {
    const maxDepth = 4;
    this.onChange(RichUtils.onTab(e, this.state.editorState, maxDepth));
  }

  _toggleBlockType(blockType) {
    this.onChange(
      RichUtils.toggleBlockType(
        this.state.editorState,
        blockType
      )
    );
  }

  _toggleInlineStyle(inlineStyle) {
    this.onChange(
      RichUtils.toggleInlineStyle(
        this.state.editorState,
        inlineStyle
      )
    );
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
        onTouchTap={this.attach.bind(this)}
      />
    ];
	  const {editorState} = this.state;
    let className = 'RichEditor-editor';
    var contentState = editorState.getCurrentContent();
    if (!contentState.hasText()) {
      if (contentState.getBlockMap().first().getType() !== 'unstyled') {
        className += ' RichEditor-hidePlaceholder';
      }
    }

		return (
			<Paper style={styles.paper} >
				<div style={styles.paperHeader}><span>新邮件</span></div>
				<TextField ref="recipient" onChange={this.recChange} value={this.state.rec} hintText={this.state.recHint} style={styles.textField} underlineShow={false} />
		    <Divider />
		    <TextField ref="title" onChange={this.tleChange} value={this.state.title} hintText={this.state.titleHint} style={styles.textField} underlineShow={false} />
		    <Divider />
		    <div className="RichEditor-root">
          <BlockStyleControls
            editorState={editorState}
            onToggle={this.toggleBlockType}
          />
          <InlineStyleControls
            editorState={editorState}
            onToggle={this.toggleInlineStyle}
          />
          <div className={className} onClick={this.focus}>
            <Editor
              blockStyleFn={getBlockStyle}
              customStyleMap={styleMap}
              editorState={editorState}
              handleKeyCommand={this.handleKeyCommand}
              onChange={this.onChange}
              onTab={this.onTab}
              ref="editor"
              spellCheck={true}
            />
          </div>
        </div>
        <Divider />
        <div>
	        <RaisedButton style={styles.raiseButton} label="发送" secondary={true} onTouchTap={this.saveMail.bind(this)}/>
	        <RaisedButton style={styles.raiseButton} label="存草稿" primary={true} onTouchTap={this.saveMail.bind(this)}/>
        	<IconButton tooltip="添加附件" style={styles.attachFile} onTouchTap={this.toggleDialog.bind(this)}>
        		<AttachFile/>
        	</IconButton>
        </div>
        <Dialog
          title="添加附件"
          actions={actions}
          modal={false}
          open={this.state.open}
          contentStyle={styles.dialog}
          onRequestClose={this.toggleDialog.bind(this)}
        >
        <form>
          <input type="file" ref="file"/><br/>
        </form>
        </Dialog>
        <Snackbar
          open={this.state.snackOpen}
          message={this.state.message}
          autoHideDuration={2000}
        />
			</Paper>
		)
	}
}

const styleMap = {
  CODE: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    fontFamily: '"Inconsolata", "Menlo", "Consolas", monospace',
    fontSize: 16,
    padding: 2,
  },
};

function getBlockStyle(block) {
  switch (block.getType()) {
    case 'blockquote': return 'RichEditor-blockquote';
    default: return null;
  }
}

class StyleButton extends Component {
  constructor() {
    super();
    this.onToggle = (e) => {
      e.preventDefault();
      this.props.onToggle(this.props.style);
    };
  }

  render() {
    let className = 'RichEditor-styleButton';
    if (this.props.active) {
      className += ' RichEditor-activeButton';
    }
    return (
      <span className={className} onMouseDown={this.onToggle}>
        {this.props.label}
      </span>
    );
  }
}

const BLOCK_TYPES = [
  {label: 'H1', style: 'header-one'},
  {label: 'H2', style: 'header-two'},
  {label: 'H3', style: 'header-three'},
  {label: 'H4', style: 'header-four'},
  {label: 'H5', style: 'header-five'},
  {label: 'H6', style: 'header-six'},
  {label: 'Blockquote', style: 'blockquote'},
  {label: 'UL', style: 'unordered-list-item'},
  {label: 'OL', style: 'ordered-list-item'},
  {label: 'Code Block', style: 'code-block'},
];

const BlockStyleControls = (props) => {
  const {editorState} = props;
  const selection = editorState.getSelection();
  const blockType = editorState
    .getCurrentContent()
    .getBlockForKey(selection.getStartKey())
    .getType();

  return (
    <div className="RichEditor-controls">
      {BLOCK_TYPES.map((type) =>
        <StyleButton
          key={type.label}
          active={type.style === blockType}
          label={type.label}
          onToggle={props.onToggle}
          style={type.style}
        />
      )}
    </div>
  );
};

var INLINE_STYLES = [
  {label: 'Bold', style: 'BOLD'},
  {label: 'Italic', style: 'ITALIC'},
  {label: 'Monospace', style: 'CODE'},
];

const InlineStyleControls = (props) => {
  var currentStyle = props.editorState.getCurrentInlineStyle();
  return (
    <div className="RichEditor-controls">
      {INLINE_STYLES.map(type =>
        <StyleButton
          key={type.label}
          active={currentStyle.has(type.style)}
          label={type.label}
          onToggle={props.onToggle}
          style={type.style}
        />
      )}
    </div>
  );
};
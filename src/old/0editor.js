
import React from 'react';
import AceEditor from 'react-ace';
import 'brace/mode/java';
import 'brace/theme/github';
class E1 extends React.Component{
	onChange=(newValue)=>{
	  console.log('change',newValue);
	}
 
	// Render editor
	render(){
	 	return <AceEditor
		    mode="java"
		    theme="github"
		    onChange={this.onChange}
		    name="UNIQUE_ID_OF_DIV"
		    editorProps={{$blockScrolling: true}}
		  />;
    }
}
export default E1;
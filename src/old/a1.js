import React from 'react';
import { render } from 'react-dom';
import brace from 'brace';
import AceEditor from 'react-ace';

import 'brace/mode/java';
import 'brace/theme/github';
import NoSSR from 'react-no-ssr';

function onChange(newValue) {
  console.log('change', newValue);
}

// Render editor
render(
  <NoSSR>
    <AceEditor
      mode="java"
      theme="github"
      onChange={onChange}
      name="UNIQUE_ID_OF_DIV"
      editorProps={{ $blockScrolling: true }}
    />
  </NoSSR>,
  document.getElementById('example')
);

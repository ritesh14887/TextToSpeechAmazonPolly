import { useState } from 'react';
import './App.css';
import { Header } from './components/header';
import AWS from 'aws-sdk';

AWS.config.update({
  accessKeyId: process.env.REACT_APP_ACCESS_KEY_ID,
  secretAccessKey: process.env.REACT_APP_SECRET_ACCESS_KEY,
  region: process.env.REACT_APP_REGION

});

const convertTextToSpeech = (text) => {
  const polly = new AWS.Polly();
  const params = {
    OutputFormat: 'mp3',
    Text: text,
    VoiceId: 'Joanna'
  };

  polly.synthesizeSpeech(params, (err, data) => {
    if (err) {
      console.log(err, err.stack);
    } else {
      const uInt8Array = new Uint8Array(data.AudioStream);
      const arrayBuffer = uInt8Array.buffer;
      const blob = new Blob([arrayBuffer]);
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      const a = document.createElement('a');
      document.body.appendChild(a);

      a.href = url;
      a.download = 'speech.mp3';
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  });
}

function App() {
  const [text, setText] = useState('');
  return (
    <div className="App">
      <Header></Header>
      <textarea id="input"
        value={text}
        onChange={(e) => { setText(e.target.value) }}
        placeholder="Enter your text here">

      </textarea>
      <button id="btn" onClick={() => convertTextToSpeech(text)}>Generate</button>
    </div >
  );
}

export default App;

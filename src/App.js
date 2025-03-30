import { useState, useEffect, useRef } from 'react';
import './App.css';
import { Header } from './components/header';
import AWS from 'aws-sdk';
import JsZip from 'jszip';
import { saveAs } from 'file-saver';

import Papa from 'papaparse';

AWS.config.update({
  accessKeyId: process.env.REACT_APP_ACCESS_KEY_ID,
  secretAccessKey: process.env.REACT_APP_SECRET_ACCESS_KEY,
  region: process.env.REACT_APP_REGION

});

function App() {
  const [csvData, setCsvData] = useState([]);
  const [serverResponses, setServerResponses] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const inputFileRef = useRef();

  const reset = () => {
    inputFileRef.current.value = "";
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    Papa.parse(file, {
      header: true,
      complete: (results) => {
        setCsvData(results.data);
      },
    });
  };

  useEffect(() => {
    if (csvData.length) {
      generateAndDownloadZip(csvData);
    }
  }, [csvData]);

  async function generateAndDownloadZip(records) {
    const zip = new JsZip();
    const blobs = []; // Store blobs for zipping
    const serverResponses = []; // Store file names for display

    for (const record of records) {
      const params = {
        Engine: "standard",
        OutputFormat: 'mp3',
        Text: record.Text,
        VoiceId: record.VoiceId,
      };

      try {
        const data = await new Promise((resolve, reject) => {
          const polly = new AWS.Polly();
          polly.synthesizeSpeech(params, (err, data) => {
            if (err) {
              setError(err.code);
              reset()
              reject(err);
            } else {
              resolve(data);
            }
          });
        });

        const uInt8Array = new Uint8Array(data.AudioStream);
        const arrayBuffer = uInt8Array.buffer;
        const blob = new Blob([arrayBuffer]);
        blobs.push({ blob, filename: record.Filename + '.mp3' });
        serverResponses.push(record.Filename + '.mp3');

      } catch (err) {
        console.error('Error synthesizing speech:', err);
      }
    }

    // Add blobs to the zip
    blobs.forEach(({ blob, filename }) => {
      zip.file(filename, blob);
    });

    // Generate the zip and download
    zip.generateAsync({ type: 'blob' }).then((zipBlob) => {
      saveAs(zipBlob, 'voiceovers.zip');
    });

    // Update state with server responses (file names)
    setServerResponses(serverResponses);
    reset();
  }

  return (
    <div className="App">
      <Header />
      <section className="container text-gray-600 body-font p-12 text-black">
        <div href="#" className="block p-6 bg-white border border-gray-200 rounded-lg shadow-sm w-[600px] h-[300px] mx-auto text-black">

          <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white text-left" for="file_input">Upload file</label>
          <input className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
            aria-describedby="file_input_help"
            id="file_input"
            type="file"
            accept='.csv'
            onChange={handleFileUpload}
            ref={inputFileRef}
          />
          <label className="block mb-2 text-sm font-medium text-orange-400 text-left" for="file_input">Select the CSV file, ensure no empty rows!</label>
          {serverResponses.length > 0 && (
            <div className='text-left text-sm'>
              <h3 className="text-black font-bold">Current Status</h3>
              <ul className='h-[30px] overflow-y-[scroll] text-sm text-gray-900 dark:text-white'>
                {serverResponses.map((item, index) => (
                  <li key={index}>{item} &#x2705;</li>
                ))}
              </ul>
            </div>
          )}
          {loading && <div>Processing...</div>}
          {error && <div className='text-red-500 text-left text-sm'>Error: {error}</div>}

        </div>

      </section>
    </div >
  );
}

export default App;

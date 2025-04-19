import { useState, useEffect, useRef } from 'react';
import './App.css';
import { Header } from './components/header';
import AWS from 'aws-sdk';
import JsZip from 'jszip';
import { saveAs } from 'file-saver';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './context/authContext';

import Papa from 'papaparse';

AWS.config.update({
  accessKeyId: process.env.REACT_APP_ACCESS_KEY_ID,
  secretAccessKey: process.env.REACT_APP_SECRET_ACCESS_KEY,
  region: process.env.REACT_APP_REGION

});

function App() {
  const [csvData, setCsvData] = useState([]);
  const [serverResponses, setServerResponses] = useState([]);
  const [error, setError] = useState('');
  const [executionError, setExecutionError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0); // Progress state
  const [fileName, setFileName] = useState('');
  const [rangeValue, setRangeValue] = useState(90)

  const inputFileRef = useRef();
  const navigate = useNavigate();

  const { userLoggedIn } = useAuth();

  useEffect(() => {
    if (!userLoggedIn) {
      navigate('/login');
    }
  }, [userLoggedIn]);


  const reset = () => {
    inputFileRef.current.value = "";

  };


  const resetForm = () => {
    inputFileRef.current.value = "";
    setProgress(0)
    setLoading(false);
    setFileName('');
    setCsvData([]);
    setServerResponses([]);
    setError('');
    setExecutionError(false);
    setRangeValue(90);
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

  async function generateAndDownloadZip(records, setLoading, setProgress) {
    setLoading(true);
    setProgress(0);
    const zip = new JsZip();
    const blobs = [];
    const serverResponses = [];
    const totalRecords = records.length;
    let processedRecords = 0;

    for (const record of records) {
      if (record.Text && record.VoiceId && record.Filename) {
        const params = {
          Engine: "neural",
          OutputFormat: 'mp3',
          Text: `<speak><prosody rate='${rangeValue}%'>${record.Text}</prosody></speak>`,
          VoiceId: record.VoiceId,
          TextType: "ssml",
        };

        try {
          const data = await new Promise((resolve, reject) => {
            const polly = new AWS.Polly();
            polly.synthesizeSpeech(params, (err, data) => {
              if (err) {
                setError(err.code);
                reset();
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
          setExecutionError(true);
          setError(err.code);
          console.log('Error synthesizing speech:', err);
        }
      }
      processedRecords++;
      setProgress((processedRecords / totalRecords) * 100);
    }

    if (!executionError) {
      blobs.forEach(({ blob, filename }) => {
        zip.file(filename, blob);
      });

      zip.generateAsync({ type: 'blob' }).then((zipBlob) => {
        saveAs(zipBlob, `${fileName ? fileName : 'voiceovers'}.zip`);
        setLoading(false);
        setProgress(100);
      }).catch((err) => {
        setLoading(false);
        setProgress(0);
        console.error("Error generating zip", err);
      });

      setServerResponses(serverResponses);
    }
    reset();
  }
  console.log(progress)
  return (
    <div className="App">
      <Header />
      <section className="container text-gray-600 body-font p-12 text-black">
        <div href="#" className="block p-6 bg-white border border-gray-200 rounded-lg shadow-sm w-[600px] h-[auto] mx-auto text-black">

          <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white text-left" for="file_input">Upload file</label>
          <input
            className="block w-full p-2 text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
            aria-describedby="file_input_help"
            id="file_input"
            type="file"
            accept='.csv'
            onChange={handleFileUpload}
            ref={inputFileRef}
          />
          {!csvData.length && <label className="block mb-2 text-xs font-medium text-[#0075ff] text-left" for="file_input">Select the CSV file, ensure no empty rows!</label>}
          <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white text-left mt-2">Output zip filename</label>
          <input
            type="text"
            className="block w-full  text-sm p-2 text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 mt-1"
            placeholder="Enter the name of the zip file"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
          />
          <label for="default-range" class="block mb-2 mt-2 align-left text-left text-sm font-medium text-gray-900 dark:text-white">Voice speed(%)</label>
          <div class="flex items-start mb-4">
            <input
              id="default-range"
              type="range"
              min="0"
              max="100"
              class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
              value={rangeValue}
              onChange={(e) => {
                setRangeValue(+e.target.value);
              }}
            />
            <span class="ml-3 text-gray-700 text-sm font-medium dark:text-gray-300">{rangeValue}</span>
          </div>
          <button
            disabled={loading || fileName === ''}
            type="button"
            className="text-white cursor-pointer disabled:cursor-not-allowed disabled:bg-slate-400 bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mt-4 w-full dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            onClick={() => {
              if (csvData.length) {
                generateAndDownloadZip(csvData, setLoading, setProgress);
              } else {
                setError('Please upload a CSV file first!');
                reset();
              }
            }
            }>
            {loading ? 'Processing...' : 'Generate'}
          </button>

          {(loading || progress === 100) && (
            <div class="w-full bg-gray-200 rounded-full dark:bg-gray-700 mt-4 mb-4">
              <div class="bg-green-700 text-xs font-medium text-blue-100 text-center p-0.5 leading-none rounded-full" style={{ width: `${progress}%` }}> {Math.round(progress)}%</div>
            </div>
          )}
          {serverResponses.length > 0 && (
            <div className='text-left text-sm overflow-y-scroll h-[150px]'>
              <h3 className="text-black font-bold">Processed: {csvData.length} files</h3>
              <ul className='h-[30px] overflow-y-[scroll] text-sm text-gray-900 dark:text-white'>
                {serverResponses.map((item, index) => (
                  <li key={index}>{item} &#x2705;</li>
                ))}
              </ul>
            </div>
          )}
          {(progress === 100) && (
            <button
              type="button"
              className="text-white cursor-pointer disabled:cursor-not-allowed disabled:bg-slate-400 bg-gray-600 hover:bg-gray-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mt-4 w-full dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
              onClick={() => {
                resetForm()
              }
              }>
              Reset
            </button>)
          }

          {error && <div className='text-red-500 text-left text-sm'>Error: {error}</div>}

        </div>

      </section>
    </div >
  );
}

export default App;

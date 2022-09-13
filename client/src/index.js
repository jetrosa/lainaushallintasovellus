import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter } from 'react-router-dom';
import './services/i18n';
import AuthProvider from './components/AuthContext'


// replace console.* for disable log on production
if (process.env.NODE_ENV === 'production') {
  console.log = () => {}
  console.error = () => {}
  console.debug = () => {}
}

ReactDOM.render(
  <BrowserRouter>
    <React.Suspense fallback="Loading...">
      <AuthProvider>
        <App />
      </AuthProvider>
    </React.Suspense>
  </BrowserRouter>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

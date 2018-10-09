import React, { Component } from 'react';
import axios from 'axios';
import io from 'socket.io-client';

import AmixerIntegerComponent from './AmixerIntegerComponent';
import AmixerEnumeratedComponent from './AmixerEnumeratedComponent';
import AmixerBooleanComponent from './AmixerBooleanComponent'
import AmixerFaderComponent from './AmixerFaderComponent'

import './App.css';
import './AmixerIntegerComponent.css';
import './AmixerEnumeratedComponent.css'
import './AmixerBooleanComponent.css'
import './AmixerFaderComponent.css'

const AmixerAPI = 'http://localhost:3000/api/cards/0/controls'
const AmixerSocket = 'http://localhost:3000'

class App extends Component {

  constructor (props) {
    super(props);

    this.state = {
      controls: null,
      meterValues: {},
      isLoading: true,
      error: null
    };
  }


  componentDidMount() {

    axios.get(AmixerAPI)
      .then (response => {
        this.setState({
          controls: response.data,
          isLoading: false
        });
      })
      .catch (error => {
        this.setState({
          error: error,
          isLoading: false
        });
      });

    //Websocket connection with AmixerAPI
    let ws = io(AmixerSocket);
    ws.on('open', () => {
        console.log('websocket is connected ...');
        // Notify Backend there's someone listening for Meter updates
        ws.send('READY');
    });
    // Receiving updates for level of all meters from AmixerAPI.
    // Deciding which controls, out of all INTEGER type sound controls are
    // actually Meters is sound card dependant, so not implemented on Backend side.
    // Instead, AmixerAPI sends a just pair of demo values to animate faders...
    ws.on('vuMetersData', (data) => {
        this.setState({meterValues: {
          0: data[0],
          1: data[1]
        }});
    });
  }

  renderIntegerControls() {
    let controls = this.state.controls;
    return Object.keys(controls)
      .filter(key => !isNaN(key))
      .filter(key => controls[key].info.type === "INTEGER")
      .filter(key => !controls[key].info.name.includes("Meter")) //<- Filtering OUT meter controls (ie. by name)
      .map(key => <AmixerIntegerComponent
        key={key}
        label='label'
        showALSAName={true}
        unit={controls[key].scale ? controls[key].scale.step.replace(/[^a-zA-Z]/g, '') : ''}
        basemin={controls[key].scale ? parseFloat(controls[key].scale['dBscale-min'], 10) : 0}
        step={controls[key].scale ? parseFloat(controls[key].scale.step, 10) : null}
        control={controls[key]}
        amixerAPI={AmixerAPI}
      />);
  }

  renderEnumeratedControls() {
    let controls = this.state.controls;
    return Object.keys(controls)
      .filter(key => !isNaN(key))
      .filter(key => controls[key].info.type === "ENUMERATED")
      .map(key => <AmixerEnumeratedComponent
        key={key}
        label='label'
        showALSAName={true}
        control={controls[key]}
        amixerAPI={AmixerAPI}
      />);
  }

  renderBooleanControls() {
    let controls = this.state.controls;
    return Object.keys(controls)
      .filter(key => !isNaN(key))
      .filter(key => controls[key].info.type === "BOOLEAN")
      .map(key => <AmixerBooleanComponent
        key={key}
        label='label'
        showALSAName={true}
        control={controls[key]}
        amixerAPI={AmixerAPI}
      />);
  }

  // Here I'm rendering a fader per each INTEGER control.
  // Ideally, a filter would be applied to get Meters out of INTEGERs
  // Then, the same AmixerAPI fake/demo values are passed to every fader as
  // values prop ... This should be changed with real ones. 
  renderFaderControls() {
    let controls = this.state.controls;
    return Object.keys(controls)
      .filter(key => !isNaN(key))
      .filter(key => controls[key].info.type === "INTEGER") //<- Using INTEGER controls as fake meters.
      //.filter(key => controls[key].info.name.includes("Meter")) //<- Filtering IN meter controls (ie. by name)
      // TODO ensure v
      .map(key => <AmixerFaderComponent
        key={key}
        someId={key}
        values={this.state.meterValues}
        label='label'
        showALSAName={true}
        control={controls[key]}
        amixerAPI={AmixerAPI}
      />);
  }


  render() {
    return (
      <div className="Container">

        <header>
          <nav className="navbar navbar-light bg-light">
            <span className="navbar-brand mb-0 h1">Using AmixerAPI on {AmixerAPI}</span>
          </nav>
        </header>

        <div className="d-flex flex-column flex-wrap p-4 m-4 border border-secondary">
          <div className="d-flex flex-row p-2">
            <span>amixer INTEGER type controls found:</span>
          </div>
          <div className="d-flex flex-row flex-wrap">
            {this.state.controls != null ? this.renderIntegerControls() : <p>Loading controls...</p>}
          </div>
        </div>

        <div className="d-flex flex-column flex-wrap p-4 m-4 border border-secondary">
          <div className="d-flex flex-row p-2">
            <span>amixer ENUMERATED type controls found:</span>
          </div>
          <div className="d-flex flex-row flex-wrap">
            {this.state.controls != null ? this.renderEnumeratedControls() : <p>Loading controls...</p>}
          </div>
        </div>

        <div className="d-flex flex-column flex-wrap p-4 m-4 border border-secondary">
          <div className="d-flex flex-row p-2">
            <span>amixer BOOLEAN type controls found:</span>
          </div>
          <div className="d-flex flex-row flex-wrap">
            {this.state.controls != null ? this.renderBooleanControls() : <p>Loading controls...</p>}
          </div>
        </div>

        <div className="d-flex flex-column flex-wrap p-4 m-4 border border-secondary">
          <div className="d-flex flex-row p-2">
            <span>amixer Meter demo:</span>
          </div>
          <div className="d-flex flex-row flex-wrap">
            {this.state.controls != null ? this.renderFaderControls() : <p>Loading controls...</p>}
          </div>
        </div>
      </div>
    );
  }

}

export default App;

import React, { Component } from 'react';
import axios from 'axios';

import './App.css';
import AmixerIntegerComponent from './AmixerIntegerComponent';
import './AmixerIntegerComponent.css';


const AmixerAPI = 'http://localhost:3000/cards/0/controls'

class App extends Component {

  constructor (props) {
    super(props);

    this.state = {
      controls: null,
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
  }

  renderIntegerControls() {
    let controls = this.state.controls;
    return Object.keys(controls)
      .filter(key => !isNaN(key))
      .filter(key => controls[key].info.type === "INTEGER")
      .map(key => <AmixerIntegerComponent
        key={key}
        label=''
        unit={controls[key].scale ? controls[key].scale.step.replace(/[^a-zA-Z]/g, '') : ''}
        basemin={controls[key].scale ? parseFloat(controls[key].scale['dBscale-min'], 10) : 0}
        step={controls[key].scale ? parseFloat(controls[key].scale.step, 10) : null}
        control={controls[key]}
        amixerAPI={AmixerAPI}
      />);
  }


  render() {
    return (
      <div className="Container">
        <header>
          <nav className="navbar navbar-light bg-light">
            <span className="navbar-brand mb-0 h1">Amixer React Components</span>
          </nav>
        </header>
        <div className="d-flex flex-row">
          {this.state.controls != null ? this.renderIntegerControls() : <p>Loading controls...</p>}
        </div>
      </div>
    );
  }

}

export default App;

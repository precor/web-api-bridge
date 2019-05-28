import React, { Component } from 'react';
import { startApis } from 'webapp-library';
import Type1 from './Type1';
import Type2 from './Type2';
import './App.css';

const parentOrigin = process.env.REACT_APP_PARENT_ORIGIN;

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {};

    startApis(parentOrigin).then(({ type, apis }) => {
      console.log('webapp1 startApis: ', type, apis);
      if (type === 'LibType1') this.setState({ loadedType: Type1 });
      else {
        this.setState({
          loadedType: Type2,
          canModPhotos: !!apis.find(api => api === 'Api3'),
        });
      }
    });
  }

  render() {
    const { loadedType, canModPhotos } = this.state;
    if (!loadedType) return null;
    console.log(`webapp1 render ${loadedType.name}`);

    return (
      <>
        {(loadedType === Type1) ? (
          <Type1 />
        ) : (
          <Type2 canModPhotos={canModPhotos} />
        )}
      </>
    );
  }
}

export default App;

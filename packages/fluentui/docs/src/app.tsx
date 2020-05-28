import * as React from 'react';
import { hot } from 'react-hot-loader/root';
import { Provider, Debug, themes } from '@fluentui/react-northstar';

import { mergeThemes } from '@fluentui/styles';
import { ThemeContext, ThemeContextData, themeContextDefaults } from './context/ThemeContext';
import Routes from './routes';
import { PerfDataProvider } from './components/ComponentDoc/PerfChart';

// Experimental dev-time accessibility attributes integrity validation.
import { setup } from '@fluentui/ability-attributes';
import { Telemetry } from '@fluentui/react-bindings';

// Temporarily disabling the validation for Screener.
if (process.env.NODE_ENV !== 'production' && !process.env.SCREENER) {
  setup();
}

const TelemetryGuard: React.FC<{
  children: (telemetryRef: React.RefObject<Telemetry>) => React.ReactElement;
}> = props => {
  const { children } = props;
  const telemetryRef = React.useRef<Telemetry>();

  React.useEffect(() => {
    (window as any).getFluentTelemetry = () => {
      console.table(telemetryRef.current.performance);
    };
  }, []);

  return children(telemetryRef);
};

class App extends React.Component<any, ThemeContextData> {
  // State also contains the updater function so it will
  // be passed down into the context provider
  state: ThemeContextData = {
    ...themeContextDefaults,
    changeTheme: (e, { value: item }) => this.setState({ themeName: item.value }),
  };

  render() {
    const { themeName } = this.state;
    return (
      <ThemeContext.Provider value={this.state}>
        <TelemetryGuard>
          {telemetryRef => (
            <Provider
              as={React.Fragment}
              telemetryRef={telemetryRef}
              theme={mergeThemes(themes.fontAwesome, themes[themeName], {
                staticStyles: [
                  {
                    a: {
                      textDecoration: 'none',
                    },
                  },
                ],
              })}
            >
              <PerfDataProvider>
                <div>
                  <Debug />
                  <Routes />
                </div>
              </PerfDataProvider>
            </Provider>
          )}
        </TelemetryGuard>
      </ThemeContext.Provider>
    );
  }
}

export default hot(App);

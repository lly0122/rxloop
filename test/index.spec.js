import rxLoop from '../src/';
import { mapTo, catchError } from "rxjs/operators";

const app = rxLoop();
app.model({
  name: 'counter',
  state: {
    counter: 0,
  },
  reducers: {
    increment(state, action) {
      return {
        ...state,
        counter: state.counter + 1,
      };
    },
    decrement(state, action) {
      return {
        ...state,
        counter: state.counter - 1,
      };
    },
    setCounter(state, action) {
      return {
        ...state,
        counter: action.counter,
      };
    }
  },
  epics: {
    getRemoteCount(action$) {
      return action$.pipe(
        mapTo({
          type: 'setCounter',
          counter: 100,
        }),
      );
    },
    isNotAction(action$) {
      return action$.pipe(
        mapTo({
          counter: 100,
        }),
      );
    }
  }
});

app.model({
  name: 'comment',
  state: {
    list: [],
  },
});

describe('Basic api', () => {
  test('exposes the public API', () => {
    const apis = Object.keys(app);

    expect(apis).toContain('model');
    expect(apis).toContain('counter$');
    expect(apis).toContain('comment$');
    expect(apis).toContain('dispatch');
    expect(apis).toContain('getState');
    expect(apis).toContain('stream');
  });

  test('default counter state is { counter: 0 }', () => {
    expect(app.getState('counter')).toEqual({
      counter: 0,
    });
  });

  test('default comment state is { list: [] }', () => {
    expect(app.getState('comment')).toEqual({
      list: [],
    });
  });

});

describe('Error check', () => {
  test('throws if is pass an existed name', () => {
    expect(() => app.model({ name: 'counter' })).toThrow()
  });

  test('throws if is duplicated type in epics and reducers', () => {
    expect(() => {
      app.model({
        name: 'test',
        state: {},
        reducers: {
          aa(state) {
            return state;
          },
        },
        epics: {
          aa(action$) {
            return action$.pipe(
              mapTo({})
            );
          },
        },
      });
    }).toThrow()
  });

  test('throws if is not pass a name', () => {
    expect(() => app.getState()).toThrow()
  });

  test('throws if is not pass name', () => {
    expect(() => app.stream()).toThrow();
  });

  test('throws if is not pass an undifined model', () => {
    expect(() => app.stream('undifined')).toThrow();
  });

  test('throws if is not pass a plain object with type', () => {
    expect(() => app.dispatch({})).toThrow();
  });
});

describe('Basic usage', () => {
  test('dispatch increment: state is { counter: 3 }', () => {
    app.dispatch({
      type: 'counter/increment',
    });
    app.dispatch({
      type: 'counter/increment',
    });
    app.dispatch({
      type: 'counter/increment',
    });
    expect(app.getState('counter')).toEqual({
      counter: 3,
    });
  });

  test('dispatch increment: state is { counter: 1 }', () => {
    const counter$ = app.stream('counter');

    app.dispatch({
      type: 'counter/decrement',
    });
    app.dispatch({
      type: 'counter/decrement',
    });
    expect(app.getState('counter')).toEqual({
      counter: 1,
    });
    let _value;
    counter$.subscribe(value => (_value = value));
    expect(_value).toEqual({
      counter: 1,
    });
  });

  test('dispatch getRemoteCount: state is { counter: 100 }', () => {
    app.dispatch({
      type: 'counter/getRemoteCount',
    });
    expect(app.getState('counter')).toEqual({
      counter: 100,
    });
  });
});

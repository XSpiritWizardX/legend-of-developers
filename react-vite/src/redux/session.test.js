import sessionReducer from "./session";

describe("sessionReducer", () => {
  test("creates an anonymous session when state is omitted", () => {
    // The reducer should provide its normal initial state on application startup.
    expect(sessionReducer(undefined, { type: "@@INIT" })).toEqual({ user: null });
  });

  test("stores a user after successful authentication", () => {
    // A normal login action should put the complete user object in the session.
    const user = { id: 7, username: "Link", email: "link@example.com" };
    expect(sessionReducer({ user: null }, {
      type: "session/setUser",
      payload: user,
    })).toEqual({ user });
  });

  test("accepts a null user payload", () => {
    // The null edge case should safely represent an unauthenticated response.
    expect(sessionReducer({ user: { id: 7 } }, {
      type: "session/setUser",
      payload: null,
    })).toEqual({ user: null });
  });

  test("clears the current user on logout", () => {
    // A logout action should return the session to its anonymous state.
    const state = { user: { id: 7, username: "Link" } };
    expect(sessionReducer(state, { type: "session/removeUser" })).toEqual({ user: null });
  });

  test("ignores an unknown action without copying state", () => {
    // An unrelated action is an edge case and must preserve the exact state object.
    const state = { user: { id: 7 } };
    expect(sessionReducer(state, { type: "game/saveCompleted" })).toBe(state);
  });
});

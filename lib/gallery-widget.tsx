import React, { useContext, useState } from "react";
import { AuthContext } from "./auth-context";
import { GalleryCompositionKind } from "./gallery-context";

export type GalleryWidgetProps = {
  kind: GalleryCompositionKind;
  serializeValue: () => string;
};

const AuthWidget: React.FC<{}> = () => {
  const ctx = useContext(AuthContext);

  if (!ctx.providerName) {
    return null;
  }

  const button = ctx.loggedInUser ? (
    <button onClick={ctx.logout}>Logout {ctx.loggedInUser.name}</button>
  ) : (
    <button onClick={ctx.login}>Login with {ctx.providerName}</button>
  );

  const error = ctx.error ? <p className="error">{ctx.error}</p> : null;

  return (
    <>
      {button}
      {error}
    </>
  );
};

const LoginWidget: React.FC<{}> = () => {
  return (
    <>
      <p>
        To publish your composition to our gallery, you will first need to
        login.
      </p>
      <AuthWidget />
    </>
  );
};

const PublishWidget: React.FC<GalleryWidgetProps> = (props) => {
  const authCtx = useContext(AuthContext);
  const [title, setTitle] = useState("");
  const handlePublish = () => {
    const serializedValue = props.serializeValue();
    console.log("TODO: Publish", props.kind, serializedValue);
  };

  if (!authCtx.providerName) return null;

  return (
    <>
      <p>
        Here you can publish your composition to our publicly-viewable gallery.
      </p>
      <div className="flex-widget thingy">
        <label htmlFor="gallery-title">Composition title:</label>
        <input
          id="gallery-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>
      <button onClick={handlePublish}>Publish to gallery</button> <AuthWidget />
    </>
  );
};

export const GalleryWidget: React.FC<GalleryWidgetProps> = (props) => {
  const authCtx = useContext(AuthContext);

  return (
    <fieldset>
      <legend>Publish</legend>
      {authCtx.loggedInUser ? <PublishWidget {...props} /> : <LoginWidget />}
    </fieldset>
  );
};

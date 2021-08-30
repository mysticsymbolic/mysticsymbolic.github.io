import { assertNotNull } from "@justfixnyc/util/commonjs";
import React, { useContext, useState } from "react";
import { AuthContext } from "./auth-context";
import { GalleryCompositionKind, GalleryContext } from "./gallery-context";

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
    <button type="button" onClick={ctx.logout}>
      Logout {ctx.loggedInUser.name}
    </button>
  ) : (
    <button type="button" onClick={ctx.login}>
      Login with {ctx.providerName}
    </button>
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
  const user = assertNotNull(authCtx.loggedInUser, "User must be logged in");
  const galleryCtx = useContext(GalleryContext);
  const [title, setTitle] = useState("");
  const [lastSerializedValue, setLastSerializedValue] = useState("");
  const handlePublish = () => {
    const serializedValue = props.serializeValue();
    setLastSerializedValue(serializedValue);
    galleryCtx.submit({
      title,
      kind: props.kind,
      serializedValue,
      owner: user.id,
      ownerName: user.name,
    });
  };
  const isSubmitting = galleryCtx.submitStatus === "submitting";

  if (galleryCtx.lastSubmission?.serializedValue === lastSerializedValue) {
    return (
      <>
        <p>Your composition "{title}" has been published!</p>
        <button
          onClick={() => {
            setLastSerializedValue("");
            setTitle("");
          }}
        >
          I want to publish more!
        </button>
      </>
    );
  }

  return (
    <>
      <p>
        Here you can publish your composition to our publicly-viewable gallery.
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handlePublish();
        }}
      >
        <div className="flex-widget thingy">
          <label htmlFor="gallery-title">Composition title:</label>
          <input
            id="gallery-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isSubmitting}
            required
          />
        </div>
        <button type="submit" disabled={isSubmitting}>
          Publish to gallery
        </button>{" "}
        {!isSubmitting && <AuthWidget />}
        {galleryCtx.submitStatus === "error" && (
          <p className="error">
            Sorry, an error occurred while submitting your composition. Please
            try again later.
          </p>
        )}
      </form>
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

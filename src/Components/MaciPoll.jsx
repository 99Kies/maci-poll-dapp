import React, { useEffect, useState } from "react";
import SWhandler from "smart-widget-handler";
import LoadingDots from "./LoadingDots";
import { useDispatch } from "react-redux";
import { setToast } from "../Store/Slides/StoreSlides";
import MaciPollCreation from "./MaciPollCreation";

export default function MaciPoll() {
  const dispatch = useDispatch();
  const [isLoading, setLoading] = useState(false);
  const [isUserLoading, setIsUserLoading] = useState(true);
  const [userMetadata, setUserMetada] = useState(false);
  const [hostOrigin, setHostOrigin] = useState(false);
  const [errMsg, setErrMsg] = useState(
    "This app needs a supported NOSTR client"
  );

  useEffect(() => {
    SWhandler.client.ready();
  }, []);

  useEffect(() => {
    let listener = SWhandler.client.listen((event) => {
      if (event.kind === "user-metadata") {
        setUserMetada(event.data?.user);
        setHostOrigin(event.data?.host_origin);
        setIsUserLoading(false);
      }
      if (event.kind === "err-msg") {
        setErrMsg(event.data);
        setIsUserLoading(false);
      }
    });

    let timer = setTimeout(() => {
      setIsUserLoading(false);
      clearTimeout(timer);
    }, 3000);

    return () => {
      listener?.close();
      clearTimeout(timer);
    };
  }, [hostOrigin]);

  const copyKey = (data) => {
    navigator.clipboard.writeText(data);
    dispatch(
      setToast({
        type: 1,
        desc: `URL was copied 👏`,
      })
    );
  };

  const sendContext = (maciRoundUrl) => {
    copyKey(maciRoundUrl);
    SWhandler.client.sendContext(maciRoundUrl, hostOrigin);
  };

  if (isUserLoading)
    return (
      <div
        className="fit-container fx-centered fx-col box-pad-h box-pad-v"
        style={{ height: "500px" }}
      >
        Connecting <LoadingDots />
      </div>
    );

  // if (!isUserLoading && !userMetadata)
  //   return (
  //     <div
  //       className="fit-container fx-centered fx-col box-pad-h box-pad-v"
  //       style={{ height: "500px" }}
  //     >
  //       <div className="round-icon">
  //         <div className="plus-sign-24" style={{ rotate: "45deg" }}></div>
  //       </div>
  //       <h4 className="p-centered">{errMsg}</h4>
  //     </div>
  //   );

  return (
    <div
      className="fit-container fx-centered fx-col box-pad-h box-pad-v"
      style={{ gap: 0 }}
    >
      {userMetadata && (
        <div className="fit-container fx-centered sc-s-18 bg-sp box-pad-h-s box-pad-v-s fx-start-h">
          <div
            style={{
              minWidth: "40px",
              minHeight: "40px",
              backgroundImage: `url(${userMetadata?.picture})`,
            }}
            className="bg-img cover-bg sc-s"
          ></div>
          <div>
            <div className="fx-centered">
              <p>{userMetadata?.display_name || userMetadata?.name}</p>
              <div className="fx-centered" style={{ gap: "5px" }}>
                <p className="green-c p-big">&#8226;</p>
                <p className="green-c p-medium">Connected</p>
              </div>
            </div>
            <p className="gray-c p-medium">
              @{userMetadata?.name || userMetadata?.display_name}
            </p>
          </div>
        </div>
      )}

      {!window.keplr && (
        <div className="fit-container fx-centered fx-col box-pad-v box-pad-h">
          <div className="keplr-icon"></div>
          <div className="box-pad-v-s box-pad-h fx-centered fx-col">
            <h4>Keplr wallet is required</h4>
            <p className="gray-c p-centered">
              It seems that you do not have Keplr wallet installed
            </p>
          </div>
          <a href={"https://www.keplr.app/get"} target="_blank">
            <button className="btn btn-gst">Install Keplr wallet</button>
          </a>
        </div>
      )}

      {window.keplr && <MaciPollCreation sendContext={sendContext}/>}
    </div>
  );
}

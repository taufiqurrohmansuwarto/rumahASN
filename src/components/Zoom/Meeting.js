import React from "react";

import { ZoomMtg } from "@zoomus/websdk";

ZoomMtg.setZoomJSLib("https://source.zoom.us/2.13.0/lib", "/av");

ZoomMtg.preLoadWasm();
ZoomMtg.prepareWebSDK();
// loads language files, also passes any error messages to the ui
ZoomMtg.i18n.load("en-US");
ZoomMtg.i18n.reload("en-US");

import axios from "axios";

function Meeting() {
  var authEndpoint = "";
  var sdkKey = "qxzOwcf4Q_eaDuiICc7glg";
  var meetingNumber = "123456789";
  var passWord = "";
  var role = 0;
  var userName = "React";
  var userEmail = "";
  var registrantToken = "";
  var zakToken = "";
  var leaveUrl = "http://localhost:3000";

  const getSignature = () => {
    axios
      .post(authEndpoint, {
        meetingNumber: meetingNumber,
        role: role,
      })
      .then((res) => {
        console.log(res);
        startMeeting(res.data.signature);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const startMeeting = (signature) => {
    document.getElementById("zmmtg-root").style.display = "block";

    ZoomMtg.init({
      leaveUrl: leaveUrl,
      isSupportAV: true,
      success: (success) => {
        console.log(success);

        ZoomMtg.join({
          signature: signature,
          meetingNumber: meetingNumber,
          userName: userName,
          apiKey: sdkKey,
          userEmail: userEmail,
          passWord: passWord,
          success: (success) => {
            console.log(success);
          },
          error: (error) => {
            console.log(error);
          },
        });
      },
    });
  };

  return <div>Meeting</div>;
}

export default Meeting;

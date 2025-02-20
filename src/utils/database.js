import AV from 'leancloud-storage';

AV.init({
  appId: process.env.REACT_APP_LEANCLOUD_APP_ID,
  appKey: process.env.REACT_APP_LEANCLOUD_APP_KEY,
  serverURL: process.env.REACT_APP_LEANCLOUD_SERVER_URL
});

export const db = AV; 
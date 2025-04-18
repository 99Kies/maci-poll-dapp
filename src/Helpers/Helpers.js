import { DORA_CONFIG } from "../Content/MACI";
import { store } from "../Store/Store";
import { ndkInstance } from "./NDKInstance";
import { SigningStargateClient } from "@cosmjs/stargate";

export const getParsedAuthor = (data) => {
  let content = JSON.parse(data.content) || {};
  let tempAuthor = {
    display_name:
      content?.display_name || content?.name || data.pubkey.substring(0, 10),
    name:
      content?.name || content?.display_name || data.pubkey.substring(0, 10),
    picture: content?.picture || "",
    pubkey: data.pubkey,
    banner: content?.banner || "",
    about: content?.about || "",
    lud06: content?.lud06 || "",
    lud16: content?.lud16 || "",
    website: content?.website || "",
    nip05: content?.nip05 || "",
  };
  return tempAuthor;
};

export const sortEvents = (events) => {
  return events.sort((ev_1, ev_2) => ev_2.created_at - ev_1.created_at);
};

export const getSubData = async (filter, timeout = 1000) => {
  if (!filter || filter.length === 0) return { data: [], pubkeys: [] };

  return new Promise((resolve, reject) => {
    let events = [];
    let pubkeys = [];

    let filter_ = filter.map((_) => {
      let temp = { ..._ };
      if (!_["#t"]) {
        delete temp["#t"];
        return temp;
      }
      return temp;
    });

    let sub = ndkInstance.subscribe(filter_, {
      cacheUsage: "CACHE_FIRST",
      groupable: false,
      skipVerification: true,
      skipValidation: true,
    });
    let timer;

    const startTimer = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        sub.stop();
        resolve({
          data: sortEvents(events),
          pubkeys: [...new Set(pubkeys)],
        });
      }, timeout);
    };

    sub.on("event", (event) => {
      pubkeys.push(event.pubkey);
      events.push(event.rawEvent());
      startTimer();
    });

    startTimer();
  });
};

export const getUser = (pubkey) => {
  const store_ = store.getState();
  const nostrAuthors = store_.nostrAuthors;
  return nostrAuthors.find((item) => item.pubkey === pubkey);
};

export const getKeplrSigner = async () => {
  try {
    const chainId = DORA_CONFIG[process.env.REACT_APP_NETWORK].chainId;
    const rpc = DORA_CONFIG[process.env.REACT_APP_NETWORK].rpc;
    await window.keplr.experimentalSuggestChain(
      DORA_CONFIG[process.env.REACT_APP_NETWORK]
    );

    await window.keplr.enable(chainId);

    const offlineSigner = window.getOfflineSigner(chainId);

    const client = await SigningStargateClient.connectWithSigner(
      rpc,
      offlineSigner
    );
    let address = await offlineSigner.getAccounts();
    if (address.length === 0) return false;
    return { signer: offlineSigner, address: address[0].address };
  } catch (err) {
    console.log(err);
    return false;
  }
};


export const makeReadableNumber = (number) => {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

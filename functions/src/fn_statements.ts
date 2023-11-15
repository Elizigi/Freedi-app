const { logger } = require("firebase-functions");
import { Timestamp, FieldValue } from "firebase-admin/firestore";
import { db } from "./index";
import admin = require('firebase-admin');
import { Collections, MapIndex, Statement } from "delib-npm";

export async function updateSubscribedListnersCB(event: any) {


  //get statement
  const { statementId } = event.params;
  const statement = event.data.after.data();

  //get all subscribers to this statement
  const subscribersRef = db.collection("statementsSubscribe");
  const q = subscribersRef.where("statementId", "==", statementId);
  const subscribersDB = await q.get();

  //update all subscribers
  subscribersDB.docs.forEach((doc: any) => {
    try {
      const subscriberId = doc.data().statementsSubscribeId;
      if (!subscriberId) throw new Error("subscriberId not found");

      db.doc(`statementsSubscribe/${subscriberId}`).set({ statement: statement, lastUpdate: Timestamp.now().toMillis() }, { merge: true });
    } catch (error) {
      logger.log("error updating subscribers", error);
    }

  });
  return
}

export async function updateParentWithNewMessageCB(e: any) {
  try {

    //get parentId
    const statement = e.data.data() as Statement;
    const { parentId, topParentId } = statement;

    logger.log("updateParentWithNewMessageCB", parentId);
    if (!parentId) throw new Error("parentId not found");
    //update map
  
    if (statement.parentId === "top") {
      
      //create map if this is top statement
      const mapRef = db.doc(`${Collections.maps}/${statement.statementId}`);
      const map = createMap(statement);
      mapRef.set(map, { merge: true });

    } else {
      
      //get parent
      const parentRef = db.doc(`statements/${parentId}`);
      const parentDB = await parentRef.get();
      const parent = parentDB.data();
      if (!parent) throw new Error("parent not found");
      //update parent
      const lastMessage = statement.statement;
      const lastUpdate = Timestamp.now().toMillis();
      parentRef.update({ lastMessage, lastUpdate, totalSubStatements: FieldValue.increment(1) });
      //update topParent
      if (topParentId) {
        const topParentRef = db.doc(`statements/${topParentId}`);
        topParentRef.update({ lastChildUpdate: lastUpdate });
      }

      //update map if this is not top statement
      const mapRef = db.doc(`${Collections.maps}/${topParentId}`);
      const mapDB = await mapRef.get().data() as MapIndex;
      if(!mapDB) throw new Error("map not found");
      const indexsParent = mapDB.index.find((i: any) => i.key === parentId); 
      mapDB.map[indexsParent.path[0]];




      //increment totalSubStatements

      if (topParentId) {
        const topParentRef = db.doc(`statements/${topParentId}`);
        topParentRef.update({ lastUpdate });
      }
    }
    return
  } catch (error) {
    logger.log("error updating parent with new message", error);
    console.error(error);
    return
  }


}

function createMap(statement: Statement): MapIndex | undefined {
  try {
    const map: MapIndex = {
      map: {
        top: {
          statementId: statement.statementId,
          statement: statement.statement,
          lastUpdate: statement.lastUpdate,
          lastMessage: '',
          results: []
        }
      },
      index: [{
        key: statement.statementId,
        path: [statement.statementId]
      }],
      lastUpdate: statement.lastUpdate
    };
    return map
  } catch (error) {
    console.error(error);
    return undefined;
  }
}




export async function sendNotificationsCB(e: any) {
  try {

    const statement = e.data.data();

    const parentId = statement.parentId;

    if (!parentId) throw new Error("parentId not found");
    logger.log("parentId", parentId);
    let title: string = "", parent;

    //get parent statement
    if (parentId === "top") { title = "הודעה חדשה" }
    else {
      const parentRef = db.doc(`statements/${parentId}`);
      const parentDB = await parentRef.get();
      parent = parentDB.data();
      const _title = parent.statement.replace(/\*/g, "");

      //bring only the first pargarpah
      const _titleArr = _title.split("\n");
      const _titleFirstParagraph = _titleArr[0];

      //limit to 20 chars
      const __first20Chars = _titleFirstParagraph.substring(0, 20);

      title = parent && parent.statement ? `בשיחה: ${__first20Chars}` : `הודעה חדשה`;
    }
    //remove * from statement and bring only the first paragraph (pargraph are created by /n)



    //get all subscribers to this statement
    const subscribersRef = db.collection(Collections.statementsSubscribe);
    const q = subscribersRef.where("statementId", "==", parentId).where("notification", "==", true);

    const subscribersDB = await q.get();
    logger.log("subscribersDB size", subscribersDB.docs.length);

    //send push notifications to all subscribers
    subscribersDB.docs.forEach((doc: any) => {
      const token = doc.data().token;
      logger.log("token:", token);

      if (token) {
        // const notifications = {
        //   notification: {
        //     title: 'הודעה חדשה',
        //     body: statement.statement
        //   },
        //   token: token,
        //   fcm_options: {
        //     link: "http://delib.org"
        //   }
        // };

        const message: any = {
          data: {
            title,
            body: statement.statement,
            url: `https://delib-5.web.app/home/statement/${parentId}`
          },
          token
        };
        admin.messaging().send(message)
          .then((response: any) => {

            // Response is a message ID string.
            logger.log('Successfully sent message:', response);
          })
          .catch((error: any) => {
            logger.error('Error sending message:', error);
          });
      }
    });

  } catch (error) {
    logger.error("error sending notifications", error);
  }
}
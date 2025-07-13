import mongoose from "mongoose";
import AnonBan from "@/utils/models/anonban.js";
import Link from "@/utils/models/link.js";
import Student from "@/utils/models/student.js";

export const CONSTANTS = {
  GUILD: {
    ID: "742797665301168220",
    ROLES: {
      LINKED: "749683320941445250",
      JUST_JOINED: "798765678739062804",
      MOD: "742798158966292640",
      ADMIN: "742800061280550923",
      BRANCH: {
        "CSE": "984846616580198450",
        "CSE (AI&ML)": "1061350128939716768",
        "ECE": "984846618371174400",
        "EEE": "984846620157964389",
        "ME": "984846621848248320",
        "BT": "984846623676969030",
        "CV": "984846625446985728",
        "B ARCH": "984846627158257684",
        "BBA": "984846628596899881",
        "B.DES": "984846630396235850",
        "BBA LLB": "984846632405315646",
        "BBA-HEM": "984846634385047632",
        "BA LLB": "984846636226314270",
        "BBA - Sports Management": "984846638025670726",
        "BCA": "984846639841820752",
        "B.Com": "984846642354192484",
        "BBA (Hons) in Business Analytics": "1023509952964341820",
        "B.Com (Hons) with ACCA": "1023510367026036826",
        "Psychology": "1023510685705044009",
        "Sports Management": "1023511154649223240",
        "Bachelor of Pharmacy": "1023512100724817940",
        "Nursing": "1061350434675101726",
        "CA": "1086905421291335711",
        "International Accounting and Finance": "1129414449485316176",
        "Business Analytics": "1136371141330608138",
        "MBA": "1289303483522093127",
        "MBBS": "1336785790730108978",
      },
      YEAR: {
        2015: "1119203107130318889",
        2016: "1106834902667759717",
        2017: "1079825096287453244",
        2018: "984846644031942697",
        2019: "984846646271696977",
        2020: "984846648112971867",
        2021: "984846649488732161",
        2022: "1023513091994025994",
        2023: "1123313984163041410",
        2024: "1244601965514588170",
        2025: "1381083961895157813",
      },
      CAMPUS: { RR: "984872936529887322", EC: "984873178339897384" },
    },
    CHANNELS: {
      LOBBY: {
        ID: "860224115633160203",
      },
      ADDITIONAL_ROLES: {
        ID: "778823213345538068",
      },
      LOGS: {
        ID: "786084620944146504",
        THREADS: {
          VERIFICATION_LOGS: { ID: "1100722146956820510" },
          ERROR_LOGS: { ID: "1129317221848596490" },
        },
      },
      ANNOUNCEMENTS: {
        ID: "749628212782563368",
      },
    },
  },
  PLACEMENTS: {
    2023: "https://docs.google.com/spreadsheets/d/1a-eaEBcTeOJESck3f8W_I3uJqRRiEc_7d5O1Xc3nIUg/edit#gid=1137367370",
    2024: "https://docs.google.com/spreadsheets/d/1YZ7HtUcvA9jqWZ04DuwTT66aTV7gU7DUlXyO2BewpII/edit#gid=1441576938",
  },
  BRANCH_SHORT_CODES: {
    "Computer Science and Engineering": "CSE",
    "Computer Science and Engineering (AI&ML)": "CSE (AI&ML)",
    "Electronics and Communication Engineering": "ECE",
    "Mechanical Engineering": "ME",
    "Electrical and Electronics Engineering": "EEE",
    "Civil Engineering": "CE",
    "Biotechnology": "BT",
    "Bachelor of Computer Applications": "BCA",
    "BA LLB": "BA LLB",
    "Psychology": "Psychology",
    "Bachelor of Business Administration": "BBA",
    "BBA LLB": "BBA LLB",
  },
};

// Singleton mongoDB connection
let cachedConnection = null;

export const connectToDatabase = async () => {
  if (cachedConnection) {
    return cachedConnection;
  }

  try {
    const connection = await mongoose.connect(process.env.MONGO_URI);
    cachedConnection = connection;

    console.log("Connected to MongoDB successfully");
    return connection;
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    throw error;
  }
};

// Export models for easy access
export const models = {
  AnonBan,
  Link,
  Student,
};

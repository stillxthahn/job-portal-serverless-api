const { unmarshall, marshall } = require("@aws-sdk/util-dynamodb");
const {
 GetCommand,
 PutCommand,
 DeleteCommand,
} = require("@aws-sdk/lib-dynamodb");
const { docClient } = require("../client");
const { ScanCommand } = require("@aws-sdk/client-dynamodb");
const JOBS_TABLE = process.env.JOBS_TABLE;

const getJob = async (req, res) => {
 const params = {
  TableName: JOBS_TABLE,
  Key: {
   id: parseInt(req.params.id, 10),
  },
 };
 try {
  const { Item } = await docClient.send(new GetCommand(params));
  if (Item) {
   res.set({
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Credentials": true,
   });
   res.json(Item);
  } else {
   res.status(404).json({ error: `Could not get job by id=${req.params.id}` });
  }
 } catch (error) {
  res.status(500).json(error);
 }
};

const createJob = async (req, res) => {
 const job = { id: Date.now(), ...req.body };
 const params = {
  TableName: JOBS_TABLE,
  Item: job,
 };
 try {
  await docClient.send(new PutCommand(params));
  res.set({
   "Access-Control-Allow-Origin": "*",
   "Access-Control-Allow-Credentials": true,
  });
  res.json(job);
 } catch (error) {
  res.status(500).json({ error });
 }
};

const updateJob = async (req, res) => {
 const params = {
  TableName: JOBS_TABLE,
  Item: req.body,
 };
 try {
  await docClient.send(new PutCommand(params));
  res.set({
   "Access-Control-Allow-Origin": "*",
   "Access-Control-Allow-Credentials": true,
  });
  res.json(req.body);
 } catch (error) {
  res.status(500).json({ error: error.message });
 }
};

const deleteJob = async (req, res) => {
 const params = {
  TableName: JOBS_TABLE,
  Key: {
   id: parseInt(req.params.id, 10),
  },
 };
 try {
  await docClient.send(new DeleteCommand(params));
  res.set({
   "Access-Control-Allow-Origin": "*",
   "Access-Control-Allow-Credentials": true,
  });
  res.json({ status: "succeed" });
 } catch (error) {
  console.log(error);
  res.status(500).json({ error: "Could not delete job" });
 }
};

const getJobsByCompanyId = async (req, res) => {
 const params = {
  TableName: JOBS_TABLE,
  FilterExpression: "idCompany = :i",
  ExpressionAttributeValues: {
   ":i": { N: req.params.id },
  },
 };
 try {
  const { Items } = await docClient.send(new ScanCommand(params));
  if (Items && Items.length > 0) {
   const unmarshalledItems = Items.map((item) => unmarshall(item));
   res.set({
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Credentials": true,
   });
   res.json(unmarshalledItems);
  } else {
   res
    .status(404)
    .json({ error: `Cannot find job by idCompany=${req.params.id}` });
  }
 } catch (error) {
  res.status(500).json({ error });
 }
};

const getJobList = async (req, res) => {
 const params = {
  TableName: JOBS_TABLE,
 };
 try {
  const { Items } = await docClient.send(new ScanCommand(params));
  if (Items && Items.length > 0) {
   const unmarshalledItems = await Items.map((item) => unmarshall(item));
   res.set({
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Credentials": true,
   });
   res.json(unmarshalledItems);
  } else {
   res.status(404).json({ error: "Cannot get job list" });
  }
 } catch (error) {
  res.status(500).json({ error });
 }
};
module.exports = {
 getJob,
 createJob,
 updateJob,
 deleteJob,
 getJobsByCompanyId,
 getJobList,
};

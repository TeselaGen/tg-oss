import axios from "axios";

const S3Download = request => {
  const url =
    (request.server || "/") +
    "/s3/" +
    (request.s3path || "") +
    request.file +
    "?bucket=" +
    (request.bucket || "");
  return axios.get(url, { responseType: "blob" }).then(res => res.data);
};

export default S3Download;

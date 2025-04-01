import axios from "axios";

const GetPdfView = async (url: string) => {

  try {
    const res = await axios.get(url, {
      responseType: "blob"
    });

    const file = new Blob([res.data], { type: "application/pdf" });

    const fileURL = URL.createObjectURL(file);

    window.open(fileURL, "_blank");
  } catch (e) {
    console.log(e);
  }
};

const ViewPdfService = {
  GetPdfView
};
export default ViewPdfService;

import "./style.css";

if (!navigator.gpu) {
  throw new Error("WebGPU nije podržan u ovom pretraživaču.");
} else {
  console.log("WebGPU je podržan!");
}

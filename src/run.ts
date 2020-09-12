import { create } from "./server";

// TODO read from environment
const PORT = 3000;

const app = create();
app.listen(PORT);

import {
  type RouteConfig,
  route,
} from "@react-router/dev/routes";

const routes: RouteConfig = [
  // Home page "/"
  route("/", "./routes/home.tsx"),

  // Study detail "/studies/:id"
  route("/studies/:id", "./routes/studies.$id.tsx"),
];

export default routes;

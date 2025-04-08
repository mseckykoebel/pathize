import Fastify from "fastify";
import dotenv from "dotenv";
import root from "./routes/root";

dotenv.config({ path: ".env" });

const fastify = Fastify({
  logger: true,
});

fastify.register(root);

const start = async () => {
  const port = Number(process.env.PORT || 3001);
  try {
    await fastify.listen({
      port: port,
      host: "0.0.0.0",
    });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();

import { execSync } from "child_process";
const CONTAINER_NAME = "aidev-redis";
const VOLUME_NAME = "aidev-redis-data";
export function ensureRedis(redisUrl) {
  // Extract port from URL (default 6379)
  const portMatch = redisUrl?.match(/:(\d+)/);
  const port = portMatch ? portMatch[1] : "6379";
  // Check if Docker is available
  try {
    execSync("docker info", { stdio: "pipe", timeout: 5000 });
  } catch (e) {
    console.warn("⚠️ Docker not available. Redis cannot start.");
    return false;
  }
  // Check if container is already running
  try {
    const status = execSync(
      `docker inspect -f '{{.State.Running}}' ${CONTAINER_NAME} 2>/dev/null`,
      { encoding: "utf-8", stdio: "pipe" }
    ).trim();
    if (status === "true") {
      if (waitForPong()) {
        console.log("✅ Redis already running (Docker)");
        return true;
      }
    }
  } catch (e) {
    // Container doesn't exist yet
  }
  // Try to restart stopped container
  try {
    execSync(`docker start ${CONTAINER_NAME}`, { stdio: "pipe", timeout: 10000 });
    if (waitForPong()) {
      console.log("✅ Redis container restarted (Docker)");
      return true;
    }
  } catch (e) {
    // Container doesn't exist — create it
  }
  // Create new container with persistent volume
  try {
    console.log("🚀 Starting Redis in Docker...");
    execSync(
      `docker run -d --name ${CONTAINER_NAME} -p ${port}:6379 -v ${VOLUME_NAME}:/data redis/redis-stack-server:latest`,
      { stdio: "pipe", timeout: 60000 }
    );
    if (waitForPong()) {
      console.log("✅ Redis started (Docker, persistent volume)");
      return true;
    }
    console.warn("⚠️ Redis container started but not responding");
    return false;
  } catch (error) {
    console.warn(`⚠️ Failed to start Redis: ${error.message}`);
    return false;
  }
}
function waitForPong() {
  for (let i = 0; i < 10; i++) {
    try {
      const result = execSync(
        `docker exec ${CONTAINER_NAME} redis-cli ping`,
        { encoding: "utf-8", stdio: "pipe", timeout: 3000 }
      ).trim();
      if (result === "PONG") return true;
    } catch (e) {  }
    execSync("sleep 0.5");
  }
  return false;
}

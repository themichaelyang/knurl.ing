import LocalConfig from "../config.dev"
import App from "./server"

App.new(LocalConfig).start()
console.log(`Server running on port ${LocalConfig.server.port}`)
import { randomBytes } from "node:crypto";
import { promises as fs } from "node:fs";
import readline from "node:readline";
import { createInterface } from "node:readline/promises";
import { hash } from "bcryptjs";

const args = new Set(process.argv.slice(2));
const envPath = new URL("../.env.local", import.meta.url);
let existing = "";
try { existing = await fs.readFile(envPath, "utf8"); } catch (error) { if (error.code !== "ENOENT") throw error; }
if (/^ADMIN_PASSWORD_HASH=.+/m.test(existing) && !args.has("--rotate")) {
  console.error("Tài khoản đã tồn tại. Dùng npm.cmd run admin:setup -- --rotate để đổi mật khẩu và kết thúc các phiên cũ."); process.exit(1);
}
function secret(prompt) {
  if (!process.stdin.isTTY) throw new Error("Hãy chạy từ terminal tương tác, hoặc dùng --generate để tạo mật khẩu ngẫu nhiên.");
  return new Promise((resolve, reject) => {
    readline.emitKeypressEvents(process.stdin);
    const previousRaw = process.stdin.isRaw;
    process.stdin.setRawMode(true); process.stdin.resume(); process.stdout.write(prompt);
    let value = "";
    const cleanup = () => { process.stdin.off("keypress", onKey); process.stdin.setRawMode(previousRaw); process.stdin.pause(); process.stdout.write("\n"); };
    const onKey = (str, key = {}) => {
      if (key.ctrl && key.name === "c") { cleanup(); reject(new Error("Đã hủy.")); }
      else if (key.name === "return" || key.name === "enter") { cleanup(); resolve(value); }
      else if (key.name === "backspace") { if (value) { value = Array.from(value).slice(0, -1).join(""); process.stdout.write("\b \b"); } }
      else if (str && !key.ctrl && !key.meta && !/[\r\n\x00-\x1f]/.test(str)) { value += str; process.stdout.write("*".repeat(Array.from(str).length)); }
    };
    process.stdin.on("keypress", onKey);
  });
}
try {
  let username = "longnga", password;
  if (args.has("--generate")) password = `${randomBytes(15).toString("base64url")}!9`;
  else {
    const terminal = createInterface({ input: process.stdin, output: process.stdout });
    username = (await terminal.question("Tên đăng nhập [longnga]: ")).trim() || "longnga";
    terminal.close();
    password = await secret("Mật khẩu mới (ít nhất 12 ký tự): ");
    const confirm = await secret("Nhập lại mật khẩu: ");
    if (password !== confirm) throw new Error("Hai mật khẩu không khớp.");
  }
  if (!/^[a-zA-Z0-9_.-]{3,80}$/.test(username)) throw new Error("Tên đăng nhập chỉ gồm 3–80 chữ, số, dấu . _ -.");
  if (password.length < 12 || Buffer.byteLength(password, "utf8") > 72) throw new Error("Mật khẩu cần ít nhất 12 ký tự, tối đa 72 byte UTF-8.");
  const replacements = { ADMIN_USERNAME: username, ADMIN_PASSWORD_HASH: await hash(password, 12), AUTH_SECRET: randomBytes(32).toString("base64url") };
  let output = existing;
  for (const [key, value] of Object.entries(replacements)) {
    // Next dotenv expansion requires escaping dollar signs in bcrypt hashes.
    const line = `${key}=${value.replaceAll("$", "\\$")}`;
    const pattern = new RegExp(`^${key}=.*$`, "m");
    output = pattern.test(output) ? output.replace(pattern, () => line) : `${output.trimEnd()}\n${line}\n`;
  }
  if (!/^CONTENT_STORAGE=/m.test(output)) output += "CONTENT_STORAGE=local\n";
  await fs.writeFile(envPath, output.trimStart(), { mode: 0o600 });
  console.log(`Đã lưu cấu hình riêng vào .env.local. Tên đăng nhập: ${username}`);
  if (args.has("--generate")) console.log(`Mật khẩu tạo ngẫu nhiên (hãy lưu vào trình quản lý mật khẩu): ${password}`);
  console.log("Khởi động lại website nếu đang chạy. Không commit .env.local; mật khẩu chỉ được lưu dưới dạng bcrypt cost 12.");
} catch (error) { console.error(error.message); process.exitCode = 1; }

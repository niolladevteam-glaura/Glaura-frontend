module.exports = async (UserModel) => {
  const now = new Date();
  const yyyyMMdd = now.toISOString().slice(0, 10).replace(/-/g, '');
  const hhmmss = now.toTimeString().slice(0, 8).replace(/:/g, '');

  const count = await UserModel.count();
  const sequence = String(count + 1).padStart(3, '0');

  return `GL${sequence}${yyyyMMdd}${hhmmss}`;
};

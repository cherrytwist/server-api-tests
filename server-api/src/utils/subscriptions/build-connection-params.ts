import { TestUser } from "@common/enum/test.user";
import { TestUtil } from "@utils/test.util";

export const buildConnectionParams = async (user: TestUser) => {
  const token = (await TestUtil.Instance()).userTokenMap.get(user);

  if (!token) {
    throw Error(`Unable to authenticate with user ${user}`);
  }

  return {
    headers: {
      authorization: `Bearer ${token}`,
    },
  };
};

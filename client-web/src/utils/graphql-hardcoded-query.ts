export const referencesData = `
  id
  name
  uri
`;

export const tagsetData = `
  id
  name
  tags
  authorization{myPrivileges}
`;

export const preferenceData = `
    id
    value
    definition {
      type
      id
      displayName
      description
      group
    }
    authorization{myPrivileges}
  `;

export const profileData = `
  id
  displayName
  description
  references {
    authorization{myPrivileges}
    ${referencesData}
  }
  tagline
  tagsets {
    authorization{myPrivileges}
    ${tagsetData}
  }
  tagset {
    ${tagsetData}
  }
  location {
    country
    city
  }
  authorization{myPrivileges}
`;

export const profileDataUser = `
  id
  displayName
  description
  references {
    authorization{myPrivileges}
    ${referencesData}
  }
  tagline
  tagsets {
    authorization{myPrivileges}
    ${tagsetData}
  }
  location {
    country
    city
  }
  visuals {
    id
    name
    uri
  }
  authorization{myPrivileges}
`;

export const agentData = `
  credentials {
    resourceID
    type
  }`;

export const userData = `
  id
  nameID
  firstName
  lastName
  email
  phone
  accountUpn
  agent {
    ${agentData}
  }
  profile {
    ${profileDataUser}
  }
  preferences{
    ${preferenceData}
   }
  authorization{myPrivileges}
`;

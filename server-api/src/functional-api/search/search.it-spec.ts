import { updateUser } from '@functional-api/contributor-management/user/user.request.params';
import { TestUser } from '@alkemio/tests-lib';
import '@utils/array.matcher';
import { uniqueId } from '@utils/uniqueId';
import { users } from '@utils/queries/users-data';
import { createPostOnCallout } from '../callout/post/post.request.params';
import { updateSubsubspaceLocation } from '../journey/subsubspace/subsubspace.request.params';
import {
  searchContributions,
  searchContributor,
  searchJourney,
} from './search.request.params';
import {
  updateSpaceLocation,
  deleteSpace,
  createSpaceAndGetData,
  updateSpaceSettings,
  updateSpacePlatformSettings,
} from '../journey/space/space.request.params';
import {
  createSubspaceWithUsers,
  createSubsubspaceWithUsers,
  createOrgAndSpaceWithUsers,
} from '@utils/data-setup/entities';
import { entitiesId } from '../../types/entities-helper';
import { SpaceVisibility } from '@generated/graphql';
import { SpacePrivacyMode } from '@generated/alkemio-schema';
import { createOrganization, deleteOrganization, updateOrganization } from '@functional-api/contributor-management/organization/organization.request.params';

let secondSpaceId = '';
const userName = 'qa user';
const country = 'Bulgaria';
const city = 'Sofia';
let organizationNameText = '';
let organizationIdTest = '';
const postNameIdSpace = 'qa-space' + uniqueId;
let postSpaceId = '';
let postSubspaceId = '';
let postSubsubspaceId = '';
const postNameIdSubspace = 'qa-chal' + uniqueId;
const postNameIdSubsubspace = 'qa-opp' + uniqueId;
const typeFilterAll = [
  'organization',
  'user',
  'space',
  'subspace',
  'subsubspace',
  'post',
];
const filterOnlyUser = ['user'];
const filterNo: never[] = [];
const termUserOnly = ['user'];
const termAll = ['qa'];
const termFullUserName = ['qa user'];
const termLocation = ['sofia'];
const termWord = ['search'];
const termNotExisting = ['notexisting'];
const termTooLong = [
  'qa',
  'user',
  'qa',
  'user',
  'qa',
  'user',
  'qa',
  'user',
  'qa',
  'user',
  'qa',
];
const organizationName = 'search-org-name' + uniqueId;
const hostNameId = 'search-org-nameid' + uniqueId;
const spaceName = 'search-space' + uniqueId;
const spaceNameId = 'search-space-nameid' + uniqueId;
const subspaceName = 'search-ch-name' + uniqueId;
const subsubspaceName = 'search-opp-name' + uniqueId;

const termAllScored = ['qa', 'qa', 'user'];

beforeAll(async () => {
  await createOrgAndSpaceWithUsers(
    organizationName,
    hostNameId,
    spaceName,
    spaceNameId
  );
  await createSubspaceWithUsers(subspaceName);
  await createSubsubspaceWithUsers(subsubspaceName);

  organizationNameText = `qa organizationNameText ${uniqueId}`;

  await updateUser(users.qaUser.id, '+359777777771', {
    location: { country: country, city: city },
  });

  await updateOrganization(entitiesId.organization.id, {
    legalEntityName: 'legalEntityName',
    domain: 'domain',
    website: 'website',
    contactEmail: 'contactEmail@mail.com',
    profileData: {
      location: { country: country, city: city },
    },
  });
  await updateSpaceLocation(
    entitiesId.spaceId,
    country,
    city,
    TestUser.GLOBAL_ADMIN
  );
  await updateSpaceLocation(
    entitiesId.subspace.id,
    country,
    city,
    TestUser.GLOBAL_ADMIN
  );
  await updateSubsubspaceLocation(
    entitiesId.subsubspace.id,
    country,
    city,
    TestUser.GLOBAL_ADMIN
  );

  const responseCreateOrganization = await createOrganization(
    organizationNameText,
    'qa-org' + uniqueId
  );
  organizationIdTest =
    responseCreateOrganization.data?.createOrganization.id ?? '';

  const resSpace = await createPostOnCallout(
    entitiesId.space.calloutId,
    { displayName: postNameIdSpace },
    postNameIdSpace
  );
  postSpaceId = resSpace.data?.createContributionOnCallout.post?.id ?? '';

  const resSubspace = await createPostOnCallout(
    entitiesId.subspace.calloutId,
    { displayName: postNameIdSubspace },
    postNameIdSubspace
  );
  postSubspaceId =
    resSubspace.data?.createContributionOnCallout.post?.id ?? '';

  const resSubsubspace = await createPostOnCallout(
    entitiesId.subsubspace.calloutId,
    { displayName: postNameIdSubsubspace },
    postNameIdSubsubspace
  );
  postSubsubspaceId =
    resSubsubspace.data?.createContributionOnCallout.post?.id ?? '';
});

afterAll(async () => {
  await deleteSpace(entitiesId.subsubspace.id);
  await deleteSpace(entitiesId.subspace.id);
  await deleteSpace(entitiesId.spaceId);
  await deleteSpace(secondSpaceId);
  await deleteOrganization(entitiesId.organization.id);
  await deleteOrganization(organizationIdTest);
});

describe('Search', () => {
  describe('Search types', () => {
    test('should search CONTRIBUTOR data', async () => {
      // Act
      const responseSearchData = await searchContributor(
        termAll,
        typeFilterAll
      );
      const result = responseSearchData.data?.search;

      // Assert
      expect(result?.contributorResultsCount).toEqual(2);
      expect(result?.contributorResults).toContainObject({
        terms: termAll,
        score: 10,
        type: 'USER',
        user: {
          id: users.qaUser.id,
          profile: {
            displayName: `${userName}`,
          },
        },
      });

      expect(result?.contributorResults).toContainObject({
        terms: termAll,
        score: 10,
        type: 'ORGANIZATION',
        organization: {
          id: `${organizationIdTest}`,
          profile: {
            displayName: `${organizationNameText}`,
          },
        },
      });
    });

    test('should search JOURNEY data', async () => {
      // Act
      const responseSearchData = await searchJourney(termWord, typeFilterAll);
      const resultJourney = responseSearchData.data?.search;
      const journeyResults = resultJourney?.journeyResults;

      // Assert
      expect(resultJourney?.journeyResultsCount).toEqual(3);
      expect(journeyResults).toContainObject({
        terms: termWord,
        score: 10,
        type: 'SPACE',
        space: {
          id: entitiesId.spaceId,
          profile: {
            displayName: spaceName,
          },
        },
      });
      expect(journeyResults).toContainObject({
        terms: termWord,
        score: 10,
        type: 'CHALLENGE',
        subspace: {
          id: entitiesId.subspace.id,
          profile: {
            displayName: subspaceName,
          },
        },
      });
      expect(journeyResults).toContainObject({
        terms: termWord,
        score: 10,
        type: 'OPPORTUNITY',
        subsubspace: {
          id: entitiesId.subsubspace.id,
          profile: {
            displayName: subsubspaceName,
          },
        },
      });
    });

    test('should search CONTRIBUTION data', async () => {
      // Act
      const responseSearchData = await searchContributions(
        termAll,
        typeFilterAll
      );
      const resultContribution = responseSearchData.data?.search;
      const contributionResults = resultContribution?.contributionResults;

      // Assert
      expect(resultContribution?.contributionResultsCount).toEqual(3);
      expect(contributionResults).toContainObject({
        terms: termAll,
        score: 10,
        type: 'POST',
        space: {
          id: entitiesId.spaceId,
          profile: {
            displayName: spaceName,
          },
        },
        subspace: null,
        subsubspace: null,
        callout: {
          id: entitiesId.space.calloutId,
          framing: {
            profile: { displayName: 'Subspace proposals' },
          },
        },
        post: {
          id: postSpaceId,
          profile: {
            displayName: postNameIdSpace,
          },
        },
      });
      expect(contributionResults).toContainObject({
        terms: termAll,
        score: 10,
        type: 'POST',
        space: {
          id: entitiesId.spaceId,
          profile: {
            displayName: spaceName,
          },
        },
        subspace: {
          id: entitiesId.subspace.id,
          profile: {
            displayName: subspaceName,
          },
        },
        subsubspace: null,
        callout: {
          id: entitiesId.subspace.calloutId,
          framing: {
            profile: { displayName: 'Subsubspace proposals' },
          },
        },
        post: {
          id: postSubspaceId,
          profile: {
            displayName: postNameIdSubspace,
          },
        },
      });
      expect(contributionResults).toContainObject({
        terms: termAll,
        score: 10,
        type: 'POST',
        space: {
          id: entitiesId.spaceId,
          profile: {
            displayName: spaceName,
          },
        },
        subspace: {
          id: entitiesId.subspace.id,
          profile: {
            displayName: subspaceName,
          },
        },
        subsubspace: {
          id: entitiesId.subsubspace.id,
          profile: {
            displayName: subsubspaceName,
          },
        },
        callout: {
          id: entitiesId.subsubspace.calloutId,
          framing: {
            profile: { displayName: 'Relevant news, research or use cases 📰' },
          },
        },
        post: {
          id: postSubsubspaceId,
          profile: {
            displayName: postNameIdSubsubspace,
          },
        },
      });
    });
  });
  test('should search with all filters applied', async () => {
    // Act
    const responseSearchData = await searchContributor(termAll, typeFilterAll);
    const result = responseSearchData.data?.search;

    // Assert
    expect(result?.contributorResultsCount).toEqual(2);
    expect(result?.contributorResults).toContainObject({
      terms: termAll,
      score: 10,
      type: 'USER',
      user: {
        id: users.qaUser.id,
        profile: {
          displayName: `${userName}`,
        },
      },
    });

    expect(result?.contributorResults).toContainObject({
      terms: termAll,
      score: 10,
      type: 'ORGANIZATION',
      organization: {
        id: `${organizationIdTest}`,
        profile: {
          displayName: `${organizationNameText}`,
        },
      },
    });
  });

  test('should search by full user name', async () => {
    // Act
    const responseSearchData = await searchContributor(
      termFullUserName,
      typeFilterAll
    );
    const result = responseSearchData.data?.search;

    // Assert
    expect(result?.contributorResultsCount).toEqual(1);
    expect(result?.contributorResults).toContainObject({
      terms: termFullUserName,
      score: 10,
      type: 'USER',
      user: {
        id: users.qaUser.id,
        profile: {
          displayName: `${userName}`,
        },
      },
    });

    expect(result?.contributorResults).not.toContainObject({
      terms: termFullUserName,
      score: 10,
      type: 'ORGANIZATION',
      organization: {
        id: `${organizationIdTest}`,
        profile: {
          displayName: `${organizationNameText}`,
        },
      },
    });
  });

  test('should search with common word filter applied', async () => {
    // Act
    const responseContributior = await searchContributor(
      termWord,
      typeFilterAll
    );
    const resultContrbutor = responseContributior.data?.search;
    const contributorResults = resultContrbutor?.contributorResults;

    const responseSearchData = await searchJourney(termWord, typeFilterAll);
    const resultJourney = responseSearchData.data?.search;
    const journeyResults = resultJourney?.journeyResults;

    // Assert
    expect(resultContrbutor?.contributorResultsCount).toEqual(1);
    expect(resultJourney?.journeyResultsCount).toEqual(3);
    expect(contributorResults).not.toContainObject({
      terms: termWord,
      score: 10,
      type: 'USER',
      user: {
        id: users.qaUser.id,
        profile: {
          displayName: `${userName}`,
        },
      },
    });

    expect(contributorResults).toContainObject({
      terms: termWord,
      score: 10,
      type: 'ORGANIZATION',
      organization: {
        id: entitiesId.organization.id,
        profile: {
          displayName: organizationName,
        },
      },
    });
    expect(journeyResults).toContainObject({
      terms: termWord,
      score: 10,
      type: 'SPACE',
      space: {
        id: entitiesId.spaceId,
        profile: {
          displayName: spaceName,
        },
      },
    });
    expect(journeyResults).toContainObject({
      terms: termWord,
      score: 10,
      type: 'CHALLENGE',
      subspace: {
        id: entitiesId.subspace.id,
        profile: {
          displayName: subspaceName,
        },
      },
    });
    expect(journeyResults).toContainObject({
      terms: termWord,
      score: 10,
      type: 'OPPORTUNITY',
      subsubspace: {
        id: entitiesId.subsubspace.id,
        profile: {
          displayName: subsubspaceName,
        },
      },
    });
  });

  test('should search with location filter applied for all entities', async () => {
    // Act
    const responseContributior = await searchContributor(
      termLocation,
      typeFilterAll
    );
    const resultContrbutor = responseContributior.data?.search;
    const contributorResults = resultContrbutor?.contributorResults;

    const responseSearchData = await searchJourney(termLocation, typeFilterAll);
    const result = responseSearchData.data?.search;
    const journeyResults = result?.journeyResults;

    // Assert
    expect(resultContrbutor?.contributorResultsCount).toEqual(2);
    expect(result?.journeyResultsCount).toEqual(3);
    expect(contributorResults).toContainObject({
      terms: termLocation,
      score: 10,
      type: 'USER',
      user: {
        id: users.qaUser.id,
        profile: {
          displayName: `${userName}`,
        },
      },
    });

    expect(contributorResults).toContainObject({
      terms: termLocation,
      score: 10,
      type: 'ORGANIZATION',
      organization: {
        id: entitiesId.organization.id,
        profile: {
          displayName: organizationName,
        },
      },
    });

    expect(journeyResults).toContainObject({
      terms: termLocation,
      score: 10,
      type: 'OPPORTUNITY',
      subsubspace: {
        id: entitiesId.subsubspace.id,
        profile: {
          displayName: subsubspaceName,
        },
      },
    });

    expect(journeyResults).toContainObject({
      terms: termLocation,
      score: 10,
      type: 'CHALLENGE',
      subspace: {
        id: entitiesId.subspace.id,
        profile: {
          displayName: subspaceName,
        },
      },
    });

    expect(journeyResults).toContainObject({
      terms: termLocation,
      score: 10,
      type: 'SPACE',
      space: {
        id: entitiesId.spaceId,
        profile: {
          displayName: spaceName,
        },
      },
    });
  });

  test('should search without filters', async () => {
    // Act
    const responseContributior = await searchContributor(
      filterNo,
      typeFilterAll
    );
    const responseJourney = await searchJourney(filterNo, typeFilterAll);

    // Assert
    expect(responseContributior.data?.search.contributorResultsCount).toEqual(
      0
    );

    expect(responseJourney.data?.search.journeyResultsCount).toEqual(0);
  });

  test('should search only for filtered users', async () => {
    // Act
    const responseContributior = await searchContributor(
      termAll,
      filterOnlyUser
    );
    const resultContrbutor = responseContributior.data?.search;
    const contributorResults = resultContrbutor?.contributorResults;

    // Assert
    expect(resultContrbutor?.contributorResultsCount).toEqual(1);
    expect(contributorResults).toContainObject({
      terms: termAll,
      score: 10,
      type: 'USER',
      user: {
        id: users.qaUser.id,
        profile: {
          displayName: `${userName}`,
        },
      },
    });

    expect(contributorResults).not.toContainObject({
      terms: termAll,
      score: 10,
      type: 'ORGANIZATION',
      organization: {
        id: `${organizationIdTest}`,
        profile: {
          displayName: `${organizationNameText}`,
        },
      },
    });
  });

  test('should search users triple score', async () => {
    // Act
    const responseContributior = await searchContributor(
      termAllScored,
      filterOnlyUser
    );
    const resultContrbutor = responseContributior.data?.search;
    const contributorResults = resultContrbutor?.contributorResults;

    // Assert
    expect(resultContrbutor?.contributorResultsCount).toEqual(1);
    expect(contributorResults).toContainObject({
      terms: ['qa', 'user'],
      score: 30,
      type: 'USER',
      user: {
        id: users.qaUser.id,
        profile: {
          displayName: `${userName}`,
        },
      },
    });

    expect(contributorResults).not.toContainObject({
      terms: ['qa'],
      score: 20,
      type: 'ORGANIZATION',
      organization: {
        id: `${organizationIdTest}`,
        profile: {
          displayName: `${organizationNameText}`,
        },
      },
    });
  });

  test('should search term users only', async () => {
    // Act
    const responseContributior = await searchContributor(
      termUserOnly,
      filterOnlyUser
    );
    const resultContrbutor = responseContributior.data?.search;
    const contributorResults = resultContrbutor?.contributorResults;

    // Assert
    expect(resultContrbutor?.contributorResultsCount).toEqual(1);
    expect(contributorResults).toContainObject({
      terms: termUserOnly,
      score: 10,
      type: 'USER',
      user: {
        id: users.qaUser.id,
        profile: {
          displayName: `${userName}`,
        },
      },
    });

    expect(contributorResults).not.toContainObject({
      terms: termUserOnly,
      score: 10,
      type: 'ORGANIZATION',
      organization: {
        id: `${organizationIdTest}`,
        profile: {
          displayName: `${organizationNameText}`,
        },
      },
    });
  });

  describe('Search negative scenarios', () => {
    test('should throw limit error for too many terms', async () => {
      // Act
      const { error: searchContributorError } = await searchContributor(
        termTooLong,
        typeFilterAll
      );
      // Assert
      expect(searchContributorError?.errors[0].message).toContain(
        'Maximum number of search terms is 10; supplied: 11'
      );

      const { error: searchJourneyError } = await searchJourney(
        termTooLong,
        typeFilterAll
      );
      expect(searchJourneyError?.errors[0].message).toContain(
        'Maximum number of search terms is 10; supplied: 11'
      );
    });

    test('should throw error for invalid filter', async () => {
      // Act
      const { error } = await searchContributor(termAll, 'invalid');
      // Assert
      expect(error?.errors[0].message).toContain(
        'Not allowed typeFilter encountered: invalid'
      );
    });

    test('should throw error for empty string search', async () => {
      // Act
      const { error } = await searchContributor(' ', typeFilterAll);
      // Assert
      expect(error?.errors[0].message).toContain(
        'Search: Skipping term below minimum length: '
      );
    });

    test('should not return any results for invalid term', async () => {
      // Act
      const responseSearchData = await searchContributor(
        termNotExisting,
        typeFilterAll
      );

      // Assert
      expect(responseSearchData.data?.search.contributorResults).toEqual([]);
    });
  });

  describe('Search filtered Space Data', () => {
    const secondSpaceName = 'search-space2' + uniqueId;

    beforeAll(async () => {
      const res = await createSpaceAndGetData(
        secondSpaceName,
        secondSpaceName,
        entitiesId.organization.id
      );
      secondSpaceId = res.data?.space.id ?? '';
    });

    afterAll(async () => {
      await deleteSpace(secondSpaceId);
    });

    test('should search JOURNEY data filtered space', async () => {
      // Act
      const responseSearchData = await searchJourney(
        termWord,
        typeFilterAll,
        TestUser.GLOBAL_ADMIN,
        entitiesId.spaceId
      );
      const resultJourney = responseSearchData.data?.search;
      const journeyResults = resultJourney?.journeyResults;

      // Assert
      expect(resultJourney?.journeyResultsCount).toEqual(2);
      expect(journeyResults).toContainObject({
        terms: termWord,
        score: 10,
        type: 'CHALLENGE',
        subspace: {
          id: entitiesId.subspace.id,
          profile: {
            displayName: subspaceName,
          },
        },
      });
      expect(journeyResults).toContainObject({
        terms: termWord,
        score: 10,
        type: 'OPPORTUNITY',
        subsubspace: {
          id: entitiesId.subsubspace.id,
          profile: {
            displayName: subsubspaceName,
          },
        },
      });
    });

    test('should search JOURNEY data filtered empty space', async () => {
      // Act
      const responseSearchData = await searchJourney(
        termWord,
        typeFilterAll,
        TestUser.GLOBAL_ADMIN,
        secondSpaceId
      );
      const resultJourney = responseSearchData.data?.search;

      // Assert
      expect(resultJourney?.journeyResultsCount).toEqual(0);
    });
  });

  describe('Search Archived Space Data', () => {
    beforeAll(async () => {
      await updateSpacePlatformSettings(
        entitiesId.spaceId,
        spaceNameId,
        SpaceVisibility.Archived
      );
    });

    test.each`
      userRole
      ${TestUser.SPACE_ADMIN}
      ${TestUser.SPACE_MEMBER}
      ${TestUser.NON_SPACE_MEMBER}
    `(
      'User: "$userRole" should not receive Space / Subspace / Subsubspace data',
      async ({ userRole }) => {
        const responseSearchData = await searchJourney(
          termLocation,
          typeFilterAll,
          userRole
        );
        const resultJourney = responseSearchData.data?.search;
        const journeyResults = resultJourney?.journeyResults;
        expect(journeyResults).not.toContainObject({
          terms: termLocation,
          score: 10,
          type: 'OPPORTUNITY',
          subsubspace: {
            id: entitiesId.subsubspace.id,
            profile: {
              displayName: subsubspaceName,
            },
          },
        });

        expect(journeyResults).not.toContainObject({
          terms: termLocation,
          score: 10,
          type: 'CHALLENGE',
          subspace: {
            id: entitiesId.subspace.id,
            profile: {
              displayName: subspaceName,
            },
          },
        });

        expect(journeyResults).not.toContainObject({
          terms: termLocation,
          score: 10,
          type: 'SPACE',
          space: {
            id: entitiesId.spaceId,
            profile: {
              displayName: spaceName,
            },
          },
        });
      }
    );

    test('GA get results for archived spaces', async () => {
      const responseSearchData = await searchJourney(
        termLocation,
        typeFilterAll,
        TestUser.GLOBAL_ADMIN
      );
      const resultJourney = responseSearchData.data?.search;

      // Assert
      expect(resultJourney?.journeyResultsCount).toEqual(0);
    });
  });

  describe('Search IN Public Space Private Subspace Data', () => {
    beforeAll(async () => {
      await updateSpacePlatformSettings(
        entitiesId.spaceId,
        spaceNameId,
        SpaceVisibility.Active
      );

      await updateSpaceSettings(entitiesId.spaceId, {
        privacy: { mode: SpacePrivacyMode.Public },
      });

      await updateSpaceSettings(entitiesId.subspace.id, {
        privacy: { mode: SpacePrivacyMode.Private },
      });
    });

    test.each`
      userRole                       | numberResults
      ${TestUser.SPACE_ADMIN}          | ${2}
      ${TestUser.SPACE_MEMBER}         | ${0}
      ${TestUser.SUBSPACE_ADMIN}    | ${2}
      ${TestUser.SUBSPACE_MEMBER}   | ${2}
      ${TestUser.SUBSUBSPACE_ADMIN}  | ${2}
      ${TestUser.SUBSUBSPACE_MEMBER} | ${2}
      ${TestUser.NON_SPACE_MEMBER}     | ${0}
    `(
      'User: "$userRole" should get "$numberResults" results for Subspace / Subsubspace data',
      async ({ userRole, numberResults }) => {
        const responseSearchData = await searchJourney(
          termWord,
          typeFilterAll,
          userRole,
          entitiesId.spaceId
        );
        const resultJourney = responseSearchData.data?.search;
        expect(resultJourney?.journeyResultsCount).toEqual(numberResults);
      }
    );
  });

  describe('Search Public Space Private Subspace Data', () => {
    beforeAll(async () => {
      await updateSpacePlatformSettings(
        entitiesId.spaceId,
        spaceNameId,
        SpaceVisibility.Active
      );

      await updateSpaceSettings(entitiesId.spaceId, {
        privacy: { mode: SpacePrivacyMode.Public },
      });

      await updateSpaceSettings(entitiesId.subspace.id, {
        privacy: { mode: SpacePrivacyMode.Private },
      });
    });

    test.each`
      userRole                       | numberResults
      ${TestUser.SPACE_ADMIN}          | ${3}
      ${TestUser.SPACE_MEMBER}         | ${1}
      ${TestUser.SUBSPACE_ADMIN}    | ${3}
      ${TestUser.SUBSPACE_MEMBER}   | ${3}
      ${TestUser.SUBSUBSPACE_ADMIN}  | ${3}
      ${TestUser.SUBSUBSPACE_MEMBER} | ${3}
      ${TestUser.NON_SPACE_MEMBER}     | ${1}
    `(
      'User: "$userRole" should get "$numberResults" results for Space /  Subspace / Subsubspace data',
      async ({ userRole, numberResults }) => {
        const responseSearchData = await searchJourney(
          termWord,
          typeFilterAll,
          userRole
        );
        const resultJourney = responseSearchData.data?.search;
        expect(resultJourney?.journeyResultsCount).toEqual(numberResults);
      }
    );
  });

  describe('Search Private Space Private Subspace Data', () => {
    beforeAll(async () => {
      await updateSpacePlatformSettings(
        entitiesId.spaceId,
        spaceNameId,
        SpaceVisibility.Active
      );

      await updateSpaceSettings(entitiesId.spaceId, {
        privacy: { mode: SpacePrivacyMode.Private },
      });

      await updateSpaceSettings(entitiesId.subspace.id, {
        privacy: { mode: SpacePrivacyMode.Private },
      });
    });

    test.each`
      userRole                       | numberResults
      ${TestUser.SPACE_ADMIN}          | ${3}
      ${TestUser.SPACE_MEMBER}         | ${1}
      ${TestUser.SUBSPACE_ADMIN}    | ${3}
      ${TestUser.SUBSPACE_MEMBER}   | ${3}
      ${TestUser.SUBSUBSPACE_ADMIN}  | ${3}
      ${TestUser.SUBSUBSPACE_MEMBER} | ${3}
      ${TestUser.NON_SPACE_MEMBER}     | ${1}
    `(
      'User: "$userRole" should get "$numberResults" results for Space / Subspace / Subsubspace data',
      async ({ userRole, numberResults }) => {
        const responseSearchData = await searchJourney(
          termWord,
          typeFilterAll,
          userRole
        );
        const resultJourney = responseSearchData.data?.search;
        expect(resultJourney?.journeyResultsCount).toEqual(numberResults);
      }
    );
  });
});

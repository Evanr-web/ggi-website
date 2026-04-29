import siteSettings from './siteSettings';
import homepage from './homepage';
import person from './person';
import program from './program';
import event from './event';
import libraryItem from './libraryItem';
import magnaliaIssue from './magnaliaIssue';
import givingTier from './givingTier';
import careerPosting from './careerPosting';
import bookStudy from './bookStudy';
import readingGroup from './readingGroup';

export const schemaTypes = [
  // Singletons
  siteSettings,
  homepage,

  // Documents
  person,
  program,
  event,
  libraryItem,
  magnaliaIssue,
  givingTier,
  careerPosting,
  bookStudy,
  readingGroup,
];

import siteSettings from './siteSettings';
import homepage from './homepage';
import programsOverview from './programsOverview';
import person from './person';
import program from './program';
import event from './event';
import libraryItem from './libraryItem';
import magnaliaIssue from './magnaliaIssue';
import givingTier from './givingTier';
import careerPosting from './careerPosting';
import bookStudy from './bookStudy';
import readingGroup from './readingGroup';
import tag from './tag';
import leadMagnet from './leadMagnet';
import mediaPage from './mediaPage';

export const schemaTypes = [
  // Singletons
  siteSettings,
  homepage,
  programsOverview,
  mediaPage,

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
  tag,
  leadMagnet,
];

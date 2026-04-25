import siteSettings from './siteSettings';
import person from './person';
import program from './program';
import event from './event';
import libraryItem from './libraryItem';
import magnaliaIssue from './magnaliaIssue';
import givingTier from './givingTier';

export const schemaTypes = [
  // Singletons
  siteSettings,

  // Documents
  person,
  program,
  event,
  libraryItem,
  magnaliaIssue,
  givingTier,
];

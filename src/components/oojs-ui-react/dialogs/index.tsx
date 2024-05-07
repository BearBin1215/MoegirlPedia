import OriginDialog from './Dialog';
import MessageDialog from './MessageDialog';

interface DialogStatics {
  // confirm: () => Promise<boolean>;
}

type DialogType = typeof OriginDialog & DialogStatics;

const Dialog = OriginDialog as DialogType;

export { Dialog, MessageDialog };

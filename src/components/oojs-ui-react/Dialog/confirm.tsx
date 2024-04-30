import OriginDialog from './Dialog';

interface DialogStatics {
  confirm: () => Promise<boolean>;
}

type DialogType = typeof OriginDialog & DialogStatics;

const Dialog = OriginDialog as DialogType;

export default Dialog;

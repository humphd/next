// XXX: need to use the built version, since Parcel throws at runtime otherwise
import Filer from '../../node_modules/filer/dist/filer';

// This function resets the current filesystem
export default (callback) => {
    new Filer.FileSystem({flags: ['FORMAT']}, callback);   
}

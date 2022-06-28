import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const toastAction = (type, content, duration = 2000) => () => toast[type](content, { autoClose: duration })
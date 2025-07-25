import { useRef, useState } from 'react';
import { MdDelete, MdCancel } from "react-icons/md";
import { FaEdit } from "react-icons/fa";
import { IoIosEye } from "react-icons/io";
import Modal from 'react-modal';
import loadingLottie from '../../lottie/loading.json';
import Lottie from 'lottie-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import _ from 'lodash'; // For debouncing
import { LuUpload } from "react-icons/lu";
import Swal from 'sweetalert2';

const EachDashTeacher = ({ teacherData, featchFullTeacherData }) => {
    const [modalIsOpen, setIsOpen] = useState(false);
    const modifiedTeacherData = {
        ...teacherData,
        date_of_birth: new Date(teacherData?.date_of_birth).toISOString().split('T')[0]
    }
    // State for form fields
    const [formData, setFormData] = useState(modifiedTeacherData);
    // teacher image upload ref
    const inputProfileImageRefForUpdate = useRef(null);
    const inputSignautreImageRefUpdate = useRef(null);
    // State for file inputs
    const [image, setImage] = useState(null);
    const [signature, setSignature] = useState(null);
    const [previewProfileImage, setPreviewProfileImage] = useState(teacherData?.image ? `${import.meta.env.VITE_BACKEND_LINK}/image/teacher/${teacherData?.image}` : null);
    const [previewSignatureImage, setPreviewSignatureImage] = useState(teacherData?.signature ? `${import.meta.env.VITE_BACKEND_LINK}/image/teacher-signeture/${teacherData?.signature}` : null);

    // state to handle the teacher creation
    const [updateTeacherLoading, setUpdateTeacherLoading] = useState(false);
    const [updateTeacherSuccess, setUpdateTeacherSuccess] = useState(false);
    const [updateTeacherError, setUpdateTeacherError] = useState("");

    // For Checking if the Teacher Id and Teacher initial is available
    const [teacherIdAvailabilityToggled, setTeacherIdAvailabilityToggled] = useState(false);
    const [teacherIdAvailable, setTeacherIdAvailable] = useState(false);
    const [teacherInitialAvailabilityToggled, setTeacherInitialAvailabilityToggled] = useState(false);
    const [teacherInitialAvailable, setTeacherInitialAvailable] = useState(false);

    // Debounced function to check teacher ID availability
    const checkTeacherIdAvailability = _.debounce(async (teacherId, eiin) => {
        try {
            // setTeacherIdChecking(true);
            setTeacherIdAvailabilityToggled(true);
            const response = await axios.get(
                `${import.meta.env.VITE_BACKEND_LINK}/teacher/isAvailable?institution_id=${eiin}&teacehr_id=${teacherId}`
            );
            setTeacherIdAvailable(!response.data.tid_exist); // true if ID is available (tid_exist: false)
            // console.log("T ID: ", response);
            // console.log("Teacher ID available: ", teacherIdAvailable)
        } catch (error) {
            console.error('Error checking teacher ID:', error);
            setTeacherIdAvailable(false);
        }
        // finally {
        //     setTeacherIdChecking(false);
        // }
    }, 500);

    // Debounced function to check teacher ID availability
    const checkTeacherInitalAvailability = _.debounce(async (teacherInitial, eiin) => {
        try {
            // setTeacherIdChecking(true);
            setTeacherInitialAvailabilityToggled(true);
            const response = await axios.get(
                `${import.meta.env.VITE_BACKEND_LINK}/teacher/isAvailable?institution_id=${eiin}&teacher_initial=${teacherInitial}`
            );
            setTeacherInitialAvailable(!response.data.tinitial_exist); // true if Initial is available (tid_exist: false)
            // console.log("T Intial: ", response);
            // console.log("Teacher Initial available: ", teacherIdAvailable)
        } catch (error) {
            console.error('Error checking teacher Initial:', error);
            setTeacherInitialAvailable(false);
        }
        // finally {
        //     setTeacherIdChecking(false);
        // }
    }, 500);

    // Handle text input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        // For checking if the teacher id is available
        if (name === "teacher_id") {
            // console.log("teacher id: ",value);
            checkTeacherIdAvailability(value, teacherData?.institution_id);
        }
        // For checking if the teacher initial is available
        if (name === "teacher_initial") {
            checkTeacherInitalAvailability(value, teacherData?.institution_id);
        }
    };


    // Form handeling prfile image Upload logic
    const handleProfileImageUplod = () => {
        const file = inputProfileImageRefForUpdate.current?.files[0];
        console.log("Input file: ", file);
        if (file) {
            // Validate file type and size
            const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/avif'];
            if (!validTypes.includes(file.type)) {
                setUpdateTeacherError('Only JPG, PNG, or GIF files are allowed');
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                setUpdateTeacherError('File size must be less than 5MB');
                return;
            }
            setImage(file);
            const reader = new FileReader();
            reader.onloadend = () => setPreviewProfileImage(reader.result);
            reader.readAsDataURL(file);
        }
    }

    // Form handeling signature image upload logic
    const handleSignatureImageUplod = () => {
        const file = inputSignautreImageRefUpdate.current?.files[0];
        if (file) {
            // Validate file type and size
            const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/avif'];
            if (!validTypes.includes(file.type)) {
                setUpdateTeacherError('Only JPG, PNG, or GIF files are allowed');
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                setUpdateTeacherError('File size must be less than 5MB');
                return;
            }
            setSignature(file);
            const reader = new FileReader();
            reader.onloadend = () => setPreviewSignatureImage(reader.result);
            reader.readAsDataURL(file);
        }
    }


    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setUpdateTeacherError('');
        setUpdateTeacherLoading(true);

        if (!teacherIdAvailable || !teacherInitialAvailable) {
            toast.error("Teacher ID and Initial must be uniqe!.", {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: false,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",
            });
            return;
        }


        // Validate required fields
        if (!image) {
            setUpdateTeacherError('Teacher image is required');
            console.log(updateTeacherError);
            return;
        }

        // Create FormData object
        const data = new FormData();
        console.log("From data: ", formData);
        for (const [key, value] of Object.entries(formData)) {
            if (value) data.append(key, value);
        }
        if (image) data.append('image', image);
        if (signature) data.append('signature', signature);

        try {
            const response = await axios.post(`${import.meta.env.VITE_BACKEND_LINK}/teacher/${teacherData?.institution_id}`, data, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            setUpdateTeacherSuccess(true);
            setFormData({
                name_eng: '',
                name_bng: '',
                teacher_id: '',
                teacher_initial: '',
                email: '',
                phone_number: '',
                date_of_birth: '',
                religion: 'islam',
                gender: 'male',
                present_adress: '',
                parmanent_adress: '',
                position: '',
                blood_group: 'A+',
                role: 'teacher'
            });
            setImage(null);
            setPreviewProfileImage(null);
            setSignature(null);
            setPreviewSignatureImage(null);
            setUpdateTeacherError('');
            setUpdateTeacherLoading(false);
            setUpdateTeacherSuccess(false);

            setTeacherIdAvailabilityToggled(false);
            setTeacherIdAvailable(false);
            setTeacherInitialAvailabilityToggled(false);
            setTeacherInitialAvailable(false);
            e.target.reset();
            toast.success("Teacher Created Successfully!", {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: false,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",
            });
        } catch (err) {
            console.error('Error Creating Teacher:', err);
            setUpdateTeacherLoading(false);
            toast.error("Some thing wrong! Unable to create teacher.", {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: false,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",
            });
        }
    };

    // --------------Handle Delete---------------
    const handleDeleteTeacher = async (institution_id, teacherId) => {
        Swal.fire({
            title: "Are you sure?",
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, delete it!"
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const response = await axios({
                        method: "DELETE",
                        url: `${import.meta.env.VITE_BACKEND_LINK}/teacher/delete/${teacherId}`,
                        headers: {
                            "Content-Type": "application/json"
                        },
                        data: {
                            institution_id
                        }
                    });

                    if (response.data.success) {
                        // Update teacher data
                        featchFullTeacherData(`${import.meta.env.VITE_BACKEND_LINK}/teacher/${teacherData.institution_id}`);
                        Swal.fire({
                            title: "Deleted!",
                            text: "The teacher has been deleted.",
                            icon: "success"
                        });
                    } else {
                        Swal.fire({
                            title: "Error!",
                            text: response.data.message || "Unable to delete teacher.",
                            icon: "error"
                        });
                    }
                } catch (err) {
                    Swal.fire({
                        title: "Error!",
                        text: err.response?.data?.message || "Something went wrong.",
                        icon: "error"
                    });
                }
            }
        });
    };



    return (
        <div>
            <div class="relative flex flex-col my-6 bg-white shadow-sm border border-slate-200 rounded-lg w-[20rem]">
                <div class="relative h-56 m-2.5 overflow-hidden text-white rounded-md">
                    <img src={`${import.meta.env.VITE_BACKEND_LINK}/image/teacher/${teacherData?.image}`} alt="teacher-image" />
                </div>
                <div class="p-4">
                    <div class="flex items-center mb-2">
                        <h6 class="text-slate-800 text-[18px] font-semibold">
                            {teacherData?.name_eng}
                        </h6>

                        <div class="flex items-center gap-0 5 ml-auto">

                            <p class="text-slate-600 text-[12px] ml-1.5">{teacherData?.position}</p>
                        </div>
                    </div>

                    <p class="text-slate-600 leading-normal font-light">
                        {teacherData?.about}
                    </p>
                </div>

                <div class="px-4 pb-4 pt-0 mt-2">
                    <div className='w-full flex items-center justify-center gap-6'>
                        {/* For Edit */}
                        <button onClick={() => setIsOpen(true)} className='p-3 rounded-full bg-gray-300/95 hover:bg-blue-600 hover:text-white'>
                            <FaEdit className='text-[18px]' />
                        </button>
                        {/* For Delete */}
                        <button onClick={() => handleDeleteTeacher(teacherData.institution_id, teacherData.id)} className='p-3 rounded-full bg-gray-300/95 hover:bg-blue-600 hover:text-white'>
                            <MdDelete className='text-[18px]' />
                        </button>
                        {/* For View */}
                        <button className='p-3 rounded-full bg-gray-300/95 hover:bg-blue-600 hover:text-white'>
                            <IoIosEye className='text-[18px]' />
                        </button>
                    </div>
                </div>
            </div>
            {/* --------Modal to update teacher information------------ */}
            <Modal isOpen={modalIsOpen} className="z-40 relative bg-white p-10">
                {/* Modal close button */}
                <div className='relative left-[100rem] top-2'>
                    <button onClick={() => setIsOpen(false)}>
                        <MdCancel className='text-2xl' />
                    </button>
                </div>

                {/* Data Loading */}
                {/* {
                    <div className=' w-full min-h-[40rem] flex items-center justify-center'>
                        <Lottie className='w-64 h-64' animationData={loadingLottie} loop={true} />
                    </div>
                } */}

                <div className='relative'>
                    <div className=''>
                        <h6 className='font-bold mb-4'>Profile Photo</h6>
                        <form
                            onSubmit={handleSubmit}
                        >
                            <div>
                                <div className='flex items-center gap-6 mt-6'>
                                    <div className="avatar">
                                        <div className="ring-primary ring-offset-base-100 w-24 rounded-full ring-2 ring-offset-2">
                                            <img
                                                src={previewProfileImage || "/public/no_image.png"}
                                                alt="Profile Preview"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-xs mt-2 text-gray-400">JPG, GIF or PNG. Maximum File Size 5MB</p>
                                        <input
                                            type="file"
                                            accept="image/png, image/jpeg, image/jpg, image/gif, image/avif"
                                            className="hidden"
                                            onChange={handleProfileImageUplod}
                                            ref={inputProfileImageRefForUpdate}

                                        />
                                        <button
                                            onClick={() => inputProfileImageRefForUpdate.current?.click()}
                                            className="mt-4 text-sm text-gray-500 py-2 px-4
                                                rounded bg-gray-200/80 hover:bg-gray-300 cursor-pointer"
                                        >
                                            Change Photo
                                        </button>
                                    </div>
                                </div>
                                <div className='grid grid-cols-2 gap-x-10 gap-y-2 mt-10'>
                                    {/* Teacher Name English */}
                                    <div className="mb-4">
                                        <label htmlFor='name_eng' className="block mb-1 font-medium">Name (English)</label>
                                        <input
                                            type="text"
                                            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-400"
                                            value={formData.name_eng}
                                            name='name_eng'
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    {/* Teacher Name (Bangla) */}
                                    <div className="mb-4">
                                        <label htmlFor='name_bng' className="block mb-1 font-medium">Name (Bangla)</label>
                                        <input
                                            type="text"
                                            name='name_bng'
                                            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-400"
                                            value={formData.name_bng}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>

                                    {/* Teacher ID */}
                                    <div className="mb-4 relative">
                                        <label htmlFor='teacher_id' className="block mb-1 font-medium">Teacher ID</label>
                                        <input
                                            type="text"
                                            className={`w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-400 ${!teacherIdAvailable && teacherIdAvailabilityToggled && "focus:border-red-400"} `}
                                            value={formData.teacher_id}
                                            name='teacher_id'
                                            onChange={handleInputChange}
                                            required
                                        />
                                        {/* Bottom Lable */}
                                        {
                                            teacherIdAvailabilityToggled &&
                                            <div className='absolute -bottom-6'>
                                                {
                                                    !teacherIdAvailable &&
                                                    <p className='text-red-500 text-sm'>Teacher ID already exists</p>
                                                }
                                            </div>
                                        }
                                        {/* Availability icon */}
                                        {
                                            teacherIdAvailabilityToggled &&
                                            <div className='absolute right-2 bottom-[0.65rem]'>
                                                {
                                                    teacherIdAvailable ?
                                                        <FaCircleCheck className='text-green-400' />
                                                        :
                                                        <MdCancel className='text-red-400' />
                                                }
                                            </div>
                                        }
                                    </div>
                                    {/* Teacehr Initial */}
                                    <div className="mb-4 relative">
                                        <label htmlFor='teacher_initial' className="block mb-1 font-medium">Teacher Initial</label>
                                        <input
                                            type="text"
                                            className={`w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-400 ${!teacherInitialAvailable && teacherInitialAvailabilityToggled && "focus:border-red-400"} `}
                                            name='teacher_initial'
                                            value={formData.teacher_initial}
                                            onChange={handleInputChange}
                                            required
                                        />
                                        {/* Bottom Lable */}
                                        {
                                            teacherInitialAvailabilityToggled &&
                                            <div className='absolute -bottom-6'>
                                                {
                                                    !teacherInitialAvailable &&
                                                    <p className='text-red-500 text-sm'>Teacher Initial already exists</p>
                                                }
                                            </div>
                                        }
                                        {/* Availability icon */}
                                        {
                                            teacherInitialAvailabilityToggled &&
                                            <div className='absolute right-2 bottom-[0.65rem]'>
                                                {
                                                    teacherInitialAvailable ?
                                                        <FaCircleCheck className='text-green-400' />
                                                        :
                                                        <MdCancel className='text-red-400' />
                                                }
                                            </div>
                                        }
                                    </div>
                                    {/* Teacher Email */}
                                    <div className="mb-4">
                                        <label htmlFor='email' className="block mb-1 font-medium">Teacher Email</label>
                                        <input
                                            type="email"
                                            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-400"
                                            value={formData.email}
                                            name='email'
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    {/* Teacher Phone Number */}
                                    <div className="mb-4">
                                        <label htmlFor='phone_number' className="block mb-1 font-medium">Teacher Phone Number</label>
                                        <input
                                            type="tel"
                                            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-400"
                                            name='phone_number'
                                            value={formData.phone_number}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    {/* Teacher Parmanent Address */}
                                    <div className="mb-4">
                                        <label htmlFor='parmanent_adress' className="block mb-1 font-medium">Parmanent Address</label>
                                        <input
                                            type="text"
                                            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-400"
                                            name='parmanent_adress'
                                            value={formData.parmanent_adress}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    {/* Teacher Present Address */}
                                    <div className="mb-4">
                                        <div className='flex items-center justify-between'>
                                            <label htmlFor='present_adress' className="block mb-1 font-medium">Present Address</label>
                                            <div>
                                                <input type="checkbox" name='paramnenetCheck' id='paramnenetCheck' />
                                                <label className='ml-1' htmlFor="paramnenetCheck">Same as Parmanent Address</label>
                                            </div>
                                        </div>
                                        <input
                                            type="text"
                                            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-400"
                                            name='present_adress'
                                            value={formData.present_adress}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="mb-4 flex items-center gap-x-6">
                                        {/* Position */}
                                        <div>
                                            <label htmlFor='position' className="block mb-1 font-medium">Position</label>
                                            <input
                                                type="text"
                                                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-400"
                                                value={formData.position}
                                                name='position'
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                        {/* Date of Birth */}
                                        <div>
                                            <label htmlFor='date_of_birth' className="block mb-1 font-medium">Date of Birth</label>
                                            <input
                                                type="date"
                                                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-400"
                                                name='date_of_birth'
                                                value={formData.date_of_birth}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="mb-4 flex items-center gap-4">
                                        {/* Signeture */}
                                        <div>
                                            <label htmlFor='tSigneture' className="block mb-1 font-medium">Signature</label>
                                            <input
                                                type="file"
                                                className="hidden"
                                                accept='image/png, image/jpeg, image/jpg, image/avif'
                                                name='tSigneture'
                                                onChange={handleSignatureImageUplod}
                                                ref={inputSignautreImageRefUpdate}

                                            />
                                            <div className='flex items-center gap-x-4'>
                                                <div className='h-10 w-[10rem] rounded'>
                                                    <img className='w-full h-full object-cover' src={`${previewSignatureImage ? previewSignatureImage : ''}`} alt="" />
                                                </div>
                                                <button
                                                    onClick={() => inputSignautreImageRefUpdate.current?.click()}
                                                    className="text-sm text-gray-500 py-4 px-4
                                                rounded bg-gray-200/80 hover:bg-gray-300 cursor-pointer"
                                                >
                                                    <LuUpload />
                                                </button>
                                            </div>
                                        </div>
                                        {/* Blood Group */}

                                        <div>
                                            <label htmlFor="blood_group" className="block mb-1 font-medium">Blood Group</label>
                                            <select
                                                name="blood_group"
                                                id="blood_group"
                                                value={formData.blood_group} onChange={handleInputChange}
                                                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-400 bg-white"
                                                required
                                            >
                                                <option value="A+">A+</option>
                                                <option value="A-">A-</option>
                                                <option value="B+">B+</option>
                                                <option value="B-">B-</option>
                                                <option value="AB+">AB+</option>
                                                <option value="AB-">AB-</option>
                                                <option value="O+">O+</option>
                                                <option value="O-">O-</option>
                                            </select>
                                        </div>

                                        {/* Gender */}
                                        <div>
                                            <label htmlFor="gender" className="block mb-1 font-medium">Gender</label>
                                            <select
                                                name="gender"
                                                id="gender"
                                                value={formData.gender} onChange={handleInputChange}
                                                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-400 bg-white"
                                                required
                                            >
                                                <option value="male">Male</option>
                                                <option value="female">Female</option>
                                                <option value="other">Other</option>
                                            </select>
                                        </div>

                                        {/* Relegion */}
                                        <div>
                                            <label htmlFor="religion" className="block mb-1 font-medium">Releigion</label>
                                            <select
                                                name="religion"
                                                id="religion"
                                                value={formData.religion} onChange={handleInputChange}
                                                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-400 bg-white"
                                                required
                                            >
                                                <option value="islam">Islam</option>
                                                <option value="christianity">Christianity</option>
                                                <option value="hinduism">Hinduism</option>
                                                <option value="buddhism">Buddhism</option>
                                                <option value="other">Other</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <div className='w-full flex items-center justify-center mt-6'>
                                    <button
                                        type="submit"
                                        className="bg-blue-600 text-white px-10 py-2 rounded hover:bg-blue-700 transition mb-24"
                                    >
                                        Submit
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                    {/* Teacher Creting Loading */}
                    {
                        updateTeacherLoading &&
                        <div className='absolute top-1/2 right-1/2 -translate-1/2'>
                            <Lottie animationData={loadingLottie} loop={true} />
                        </div>
                    }
                </div>

            </Modal>
        </div>
    );
};

export default EachDashTeacher;
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
import { FaCircleCheck } from "react-icons/fa6";

const EachDashStudent = ({ studentData, featchFullStudentData }) => {
    const [modalIsOpen, setIsOpen] = useState(false);
    const modifiedStudentData = {
        ...studentData,
        date_of_birth: new Date(studentData?.date_of_birth).toISOString().split('T')[0]
    };
    // State for form fields
    const [formData, setFormData] = useState(modifiedStudentData);
    // Student image upload ref
    const inputProfileImageRefForUpdate = useRef(null);
    const inputSignatureImageRefUpdate = useRef(null);
    // State for file inputs
    const [image, setImage] = useState(null);
    const [signature, setSignature] = useState(null);
    const [previewProfileImage, setPreviewProfileImage] = useState(studentData?.image ? `${import.meta.env.VITE_BACKEND_LINK}/image/student/${studentData?.image}` : null);
    const [previewSignatureImage, setPreviewSignatureImage] = useState(studentData?.signature ? `${import.meta.env.VITE_BACKEND_LINK}/image/student-signature/${studentData?.signature}` : null);

    // State to handle the student update
    const [updateStudentLoading, setUpdateStudentLoading] = useState(false);
    const [updateStudentSuccess, setUpdateStudentSuccess] = useState(false);
    const [updateStudentError, setUpdateStudentError] = useState("");

    // For checking if the student ID is available
    const [studentIdAvailabilityToggled, setStudentIdAvailabilityToggled] = useState(false);
    const [studentIdAvailable, setStudentIdAvailable] = useState(false);

    // Debounced function to check student ID availability
    const checkStudentIdAvailability = _.debounce(async (studentId, eiin) => {
        try {
            setStudentIdAvailabilityToggled(true);
            const response = await axios.get(
                `${import.meta.env.VITE_BACKEND_LINK}/student/isAvailable?institution_id=${eiin}&student_id=${studentId}`
            );
            setStudentIdAvailable(!response.data.sid_exist); // true if ID is available
        } catch (error) {
            console.error('Error checking student ID:', error);
            setStudentIdAvailable(false);
        }
    }, 500);

    // Handle text input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        if (name === "student_id") {
            checkStudentIdAvailability(value, studentData?.institution_id);
        }
    };

    // Form handling profile image upload logic
    const handleProfileImageUpload = () => {
        const file = inputProfileImageRefForUpdate.current?.files[0];
        if (file) {
            // Validate file type and size
            const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/avif'];
            if (!validTypes.includes(file.type)) {
                setUpdateStudentError('Only JPG, PNG, GIF, or AVIF files are allowed');
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                setUpdateStudentError('File size must be less than 5MB');
                return;
            }
            setImage(file);
            const reader = new FileReader();
            reader.onloadend = () => setPreviewProfileImage(reader.result);
            reader.readAsDataURL(file);
        }
    };

    // Form handling signature image upload logic
    const handleSignatureImageUpload = () => {
        const file = inputSignatureImageRefUpdate.current?.files[0];
        if (file) {
            // Validate file type and size
            const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/avif'];
            if (!validTypes.includes(file.type)) {
                setUpdateStudentError('Only JPG, PNG, GIF, or AVIF files are allowed');
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                setUpdateStudentError('File size must be less than 5MB');
                return;
            }
            setSignature(file);
            const reader = new FileReader();
            reader.onloadend = () => setPreviewSignatureImage(reader.result);
            reader.readAsDataURL(file);
        }
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setUpdateStudentError('');
        setUpdateStudentLoading(true);

        if (!studentIdAvailable) {
            toast.error("Student ID must be unique!", {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: false,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",
            });
            setUpdateStudentLoading(false);
            return;
        }

        // Validate required fields
        if (!image) {
            setUpdateStudentError('Student image is required');
            setUpdateStudentLoading(false);
            return;
        }

        // Create FormData object
        const data = new FormData();
        for (const [key, value] of Object.entries(formData)) {
            if (value) data.append(key, value);
        }
        if (image) data.append('image', image, `${image.name}`);
        if (signature) data.append('signature', signature, `${signature.name}`);

        try {
            const response = await axios.put(`${import.meta.env.VITE_BACKEND_LINK}/student/${studentData?.institution_id}/${studentData?.id}`, data, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            setUpdateStudentSuccess(true);
            setFormData({
                name_eng: '',
                name_bng: '',
                student_id: '',
                batch_id: '',
                class_id: '',
                section_id: '',
                class_roll: '',
                email: '',
                phone_number: '',
                date_of_birth: '',
                religion: 'islam',
                gender: 'male',
                present_adress: '',
                parmanent_adress: '',
                blood_group: 'A+',
                status: 'current',
                role: 'student'
            });
            setImage(null);
            setPreviewProfileImage(null);
            setSignature(null);
            setPreviewSignatureImage(null);
            setUpdateStudentError('');
            setUpdateStudentLoading(false);
            setUpdateStudentSuccess(false);
            setStudentIdAvailabilityToggled(false);
            setStudentIdAvailable(false);
            e.target.reset();
            toast.success("Student Updated Successfully!", {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: false,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",
            });
            featchFullStudentData(`${import.meta.env.VITE_BACKEND_LINK}/student/${studentData.institution_id}`);
            setIsOpen(false);
        } catch (err) {
            console.error('Error Updating Student:', err);
            setUpdateStudentLoading(false);
            toast.error("Something went wrong! Unable to update student.", {
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

    // Handle Delete
    const handleDeleteStudent = async (institution_id, studentId) => {
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
                        url: `${import.meta.env.VITE_BACKEND_LINK}/student/delete/${studentId}`,
                        headers: {
                            "Content-Type": "application/json"
                        },
                        data: {
                            institution_id
                        }
                    });

                    if (response.data.success) {
                        featchFullStudentData(`${import.meta.env.VITE_BACKEND_LINK}/student/${studentData.institution_id}`);
                        Swal.fire({
                            title: "Deleted!",
                            text: "The student has been deleted.",
                            icon: "success"
                        });
                    } else {
                        Swal.fire({
                            title: "Error!",
                            text: response.data.message || "Unable to delete student.",
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
            <div className="relative flex flex-col my-6 bg-white shadow-sm border border-slate-200 rounded-lg w-[20rem]">
                <div className="relative h-56 m-2.5 overflow-hidden text-white rounded-md">
                    <img src={`${import.meta.env.VITE_BACKEND_LINK}/image/student/${studentData?.image}`} alt="student-image" />
                </div>
                <div className="p-4">
                    <div className="flex items-center mb-2">
                        <h6 className="text-slate-800 text-[18px] font-semibold">
                            {studentData?.name_eng}
                        </h6>
                        <div className="flex items-center gap-0 5 ml-auto">
                            <p className="text-slate-600 text-[12px] ml-1.5">Roll: {studentData?.class_roll}</p>
                        </div>
                    </div>
                    <p className="text-slate-600 leading-normal font-light">
                        Batch: {studentData?.batch_id}, Class: {studentData?.class_id}, Section: {studentData?.section_id}
                    </p>
                </div>
                <div className="px-4 pb-4 pt-0 mt-2">
                    <div className='w-full flex items-center justify-center gap-6'>
                        {/* For Edit */}
                        <button onClick={() => setIsOpen(true)} className='p-3 rounded-full bg-gray-300/95 hover:bg-blue-600 hover:text-white'>
                            <FaEdit className='text-[18px]' />
                        </button>
                        {/* For Delete */}
                        <button onClick={() => handleDeleteStudent(studentData.institution_id, studentData.id)} className='p-3 rounded-full bg-gray-300/95 hover:bg-blue-600 hover:text-white'>
                            <MdDelete className='text-[18px]' />
                        </button>
                        {/* For View */}
                        <button className='p-3 rounded-full bg-gray-300/95 hover:bg-blue-600 hover:text-white'>
                            <IoIosEye className='text-[18px]' />
                        </button>
                    </div>
                </div>
            </div>
            {/* Modal to update student information */}
            <Modal isOpen={modalIsOpen} className="z-40 relative bg-white p-10">
                <div className='relative left-[100rem] top-2'>
                    <button onClick={() => setIsOpen(false)}>
                        <MdCancel className='text-2xl' />
                    </button>
                </div>
                <div className='relative'>
                    <div className=''>
                        <h6 className='font-bold mb-4'>Profile Photo</h6>
                        <form onSubmit={handleSubmit}>
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
                                        <p className="text-xs mt-2 text-gray-400">JPG, GIF, PNG, or AVIF. Maximum File Size 5MB</p>
                                        <input
                                            type="file"
                                            accept="image/png, image/jpeg, image/jpg, image/gif, image/avif"
                                            className="hidden"
                                            onChange={handleProfileImageUpload}
                                            ref={inputProfileImageRefForUpdate}
                                        />
                                        <button
                                            onClick={() => inputProfileImageRefForUpdate.current?.click()}
                                            className="mt-4 text-sm text-gray-500 py-2 px-4 rounded bg-gray-200/80 hover:bg-gray-300 cursor-pointer"
                                        >
                                            Change Photo
                                        </button>
                                    </div>
                                </div>
                                <div className='grid grid-cols-2 gap-x-10 gap-y-2 mt-10'>
                                    {/* Student Name English */}
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
                                    {/* Student Name (Bangla) */}
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
                                    {/* Student ID */}
                                    <div className="mb-4 relative">
                                        <label htmlFor='student_id' className="block mb-1 font-medium">Student ID</label>
                                        <input
                                            type="text"
                                            className={`w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-400 ${!studentIdAvailable && studentIdAvailabilityToggled && "focus:border-red-400"} `}
                                            value={formData.student_id}
                                            name='student_id'
                                            onChange={handleInputChange}
                                            required
                                        />
                                        {studentIdAvailabilityToggled && (
                                            <div className='absolute -bottom-6'>
                                                {!studentIdAvailable && (
                                                    <p className='text-red-500 text-sm'>Student ID already exists</p>
                                                )}
                                            </div>
                                        )}
                                        {studentIdAvailabilityToggled && (
                                            <div className='absolute right-2 bottom-[0.65rem]'>
                                                {studentIdAvailable ? (
                                                    <FaCircleCheck className='text-green-400' />
                                                ) : (
                                                    <MdCancel className='text-red-400' />
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    {/* Class Roll */}
                                    <div className="mb-4">
                                        <label htmlFor='class_roll' className="block mb-1 font-medium">Class Roll</label>
                                        <input
                                            type="text"
                                            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-400"
                                            value={formData.class_roll}
                                            name='class_roll'
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    {/* Batch ID */}
                                    <div className="mb-4">
                                        <label htmlFor='batch_id' className="block mb-1 font-medium">Batch ID</label>
                                        <input
                                            type="text"
                                            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-400"
                                            value={formData.batch_id}
                                            name='batch_id'
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    {/* Class ID */}
                                    <div className="mb-4">
                                        <label htmlFor='class_id' className="block mb-1 font-medium">Class ID</label>
                                        <input
                                            type="text"
                                            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-400"
                                            value={formData.class_id}
                                            name='class_id'
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    {/* Section ID */}
                                    <div className="mb-4">
                                        <label htmlFor='section_id' className="block mb-1 font-medium">Section ID</label>
                                        <input
                                            type="text"
                                            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-400"
                                            value={formData.section_id}
                                            name='section_id'
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    {/* Student Email */}
                                    <div className="mb-4">
                                        <label htmlFor='email' className="block mb-1 font-medium">Student Email</label>
                                        <input
                                            type="email"
                                            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-400"
                                            value={formData.email}
                                            name='email'
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    {/* Student Phone Number */}
                                    <div className="mb-4">
                                        <label htmlFor='phone_number' className="block mb-1 font-medium">Student Phone Number</label>
                                        <input
                                            type="tel"
                                            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-400"
                                            name='phone_number'
                                            value={formData.phone_number}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    {/* Permanent Address */}
                                    <div className="mb-4">
                                        <label htmlFor='parmanent_adress' className="block mb-1 font-medium">Permanent Address</label>
                                        <input
                                            type="text"
                                            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-400"
                                            name='parmanent_adress'
                                            value={formData.parmanent_adress}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    {/* Present Address */}
                                    <div className="mb-4">
                                        <div className='flex items-center justify-between'>
                                            <label htmlFor='present_adress' className="block mb-1 font-medium">Present Address</label>
                                            <div>
                                                <input type="checkbox" name='permanentCheck' id='permanentCheck' />
                                                <label className='ml-1' htmlFor="permanentCheck">Same as Permanent Address</label>
                                            </div>
                                        </div>
                                        <input
                                            type="text"
                                            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-400"
                                            name='present_adress'
                                            value={formData.present_adress}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div className="mb-4 flex items-center gap-x-6">
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
                                        {/* Status */}
                                        <div>
                                            <label htmlFor="status" className="block mb-1 font-medium">Status</label>
                                            <select
                                                name="status"
                                                id="status"
                                                value={formData.status}
                                                onChange={handleInputChange}
                                                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-400 bg-white"
                                                required
                                            >
                                                <option value="current">Current</option>
                                                <option value="inactive">Inactive</option>
                                                <option value="graduated">Graduated</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="mb-4 flex items-center gap-4">
                                        {/* Signature */}
                                        <div>
                                            <label htmlFor='signature' className="block mb-1 font-medium">Signature</label>
                                            <input
                                                type="file"
                                                className="hidden"
                                                accept='image/png, image/jpeg, image/jpg, image/avif'
                                                name='signature'
                                                onChange={handleSignatureImageUpload}
                                                ref={inputSignatureImageRefUpdate}
                                            />
                                            <div className='flex items-center gap-x-4'>
                                                <div className='h-10 w-[10rem] rounded'>
                                                    <img className='w-full h-full object-cover' src={previewSignatureImage || ''} alt="" />
                                                </div>
                                                <button
                                                    onClick={() => inputSignatureImageRefUpdate.current?.click()}
                                                    className="text-sm text-gray-500 py-4 px-4 rounded bg-gray-200/80 hover:bg-gray-300 cursor-pointer"
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
                                                value={formData.blood_group}
                                                onChange={handleInputChange}
                                                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-400 bg-white"
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
                                                value={formData.gender}
                                                onChange={handleInputChange}
                                                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-400 bg-white"
                                                required
                                            >
                                                <option value="male">Male</option>
                                                <option value="female">Female</option>
                                                <option value="other">Other</option>
                                            </select>
                                        </div>
                                        {/* Religion */}
                                        <div>
                                            <label htmlFor="religion" className="block mb-1 font-medium">Religion</label>
                                            <select
                                                name="religion"
                                                id="religion"
                                                value={formData.religion}
                                                onChange={handleInputChange}
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
                    {updateStudentLoading && (
                        <div className='absolute top-1/2 right-1/2 -translate-1/2'>
                            <Lottie animationData={loadingLottie} loop={true} />
                        </div>
                    )}
                </div>
            </Modal>
        </div>
    );
};

export default EachDashStudent;
import axios from 'axios';
import React, { useState, useRef, useContext } from 'react';
import { IoCreateOutline } from "react-icons/io5";
import { LuUpload } from "react-icons/lu";
import { useLocation } from 'react-router';
import { toast } from 'react-toastify';
import { FaCircleCheck } from "react-icons/fa6";
import { MdCancel } from "react-icons/md";
import _ from 'lodash'; // For debouncing
import loadingLottie from '../../lottie/loading.json'
import Lottie from 'lottie-react';
import FullTeacherInfoCotext from '../../contextapi/fullTeacherInfo/fullTeacherInfoContext';
import EachDashTeacher from './EachDashTeacher';


const DashTeacherComponent = () => {
    const currentLocation = useLocation();
    const [searchType, setSearchType] = useState("ID");
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [searchValue, setSearchValue] = useState("");
    const [isCreating, setIsCreating] = useState(false);
    const inputRef = useRef(null);

    const regex = /(?<=^\/)(\d+)(?=\/|$)/;
    const eiinValue = currentLocation.pathname?.match(regex)[0];
    // console.log("Eiin: ", eiinValue);

    // Form fileds to create new teacher
    // State for form fields
    const [formData, setFormData] = useState({
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

    // teacher image upload ref
    const inputProfileImageRef = useRef(null);
    const inputSignautreImageRef = useRef(null);
    // State for file inputs
    const [image, setImage] = useState(null);
    const [signature, setSignature] = useState(null);
    const [previewProfileImage, setPreviewProfileImage] = useState(null);
    const [previewSignatureImage, setPreviewSignatureImage] = useState(null);

    // state to handle the teacher creation
    const [createTeacherLoading, setCreateTeacherLoading] = useState(false);
    const [createTeacherSuccess, setCreateTeacherSuccess] = useState(false);
    const [createTeacherError, setCreateTeacherError] = useState("");

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
            checkTeacherIdAvailability(value, eiinValue);
        }
        // For checking if the teacher initial is available
        if (name === "teacher_initial") {
            checkTeacherInitalAvailability(value, eiinValue);
        }
    };


    // Form handeling prfile image Upload logic
    const handleProfileImageUplod = () => {
        const file = inputProfileImageRef.current?.files[0];
        console.log("Input file: ", file);
        if (file) {
            // Validate file type and size
            const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/avif'];
            if (!validTypes.includes(file.type)) {
                setCreateTeacherError('Only JPG, PNG, or GIF files are allowed');
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                setCreateTeacherError('File size must be less than 5MB');
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
        const file = inputSignautreImageRef.current?.files[0];
        if (file) {
            // Validate file type and size
            const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/avif'];
            if (!validTypes.includes(file.type)) {
                setCreateTeacherError('Only JPG, PNG, or GIF files are allowed');
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                setCreateTeacherError('File size must be less than 5MB');
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
        setCreateTeacherError('');
        setCreateTeacherLoading(true);

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
            setCreateTeacherError('Teacher image is required');
            console.log(createTeacherError);
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
            const response = await axios.post(`${import.meta.env.VITE_BACKEND_LINK}/teacher/${eiinValue}`, data, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            setCreateTeacherSuccess(true);
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
            setCreateTeacherError('');
            setCreateTeacherLoading(false);
            setCreateTeacherSuccess(false);

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
            setCreateTeacherLoading(false);
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


    // __________

    const handleDropdownToggle = (e) => {
        e.preventDefault();
        setDropdownOpen((prev) => !prev);
    };

    const handleDropdownSelect = (type) => {
        setSearchType(type);
        setDropdownOpen(false);
        inputRef.current?.focus();
    };

    const handleSearchInput = (e) => {
        setSearchValue(e.target.value);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        // Implement your search logic here
        alert(`Searching by ${searchType}: ${searchValue}`);
    };


    // For handeling the Teacher creating togol logic
    const handleCreate = () => {
        setIsCreating(true);
    }

    // -----------
    // For getting all teacher
    const { fullTeacherData, featchFullTeacherData, fullTeacherLoading, fullTeacherError } = useContext(FullTeacherInfoCotext);

    if (!fullTeacherData) {
        featchFullTeacherData(`${import.meta.env.VITE_BACKEND_LINK}/teacher?institution_id=${eiinValue}`)
    }

    // console.log("Full Teacher Data: ", fullTeacherData);

    return (
        <div>
            <div className='flex items-center justify-center'>
                <div>
                    {/* Search and new teacher entry section */}
                    {
                        !isCreating &&
                        <div className='w-full bg-gray-800 rounded-xl py-8 px-8 mt-10 mx-16 flex items-center justify-between'>
                            {/* search box */}
                            <form onSubmit={handleSearch}>
                                <div className="w-full max-w-sm min-w-[200px] bg-white rounded">
                                    <div className="relative mt-2">
                                        <div className="absolute top-1 left-1 flex items-center z-20">
                                            <button
                                                id="dropdownButton"
                                                type="button"
                                                onClick={handleDropdownToggle}
                                                className="rounded border border-transparent py-1 px-1.5 text-center flex items-center text-sm transition-all text-slate-600"
                                            >
                                                <span id="dropdownSpan" className="text-ellipsis overflow-hidden">
                                                    {searchType}
                                                </span>
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    strokeWidth="1.5"
                                                    stroke="currentColor"
                                                    className="h-4 w-4 ml-1"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="m19.5 8.25-7.5 7.5-7.5-7.5"
                                                    />
                                                </svg>
                                            </button>
                                            <div className="h-6 border-l border-slate-200 ml-1" />
                                            <div
                                                id="dropdownMenu"
                                                className={`min-w-[150px] absolute left-0 mt-10 bg-white border border-slate-200 rounded-md shadow-lg z-30 ${dropdownOpen ? "" : "hidden"}`}
                                            >
                                                <ul id="dropdownOptions">
                                                    <li
                                                        className="px-4 py-2 text-slate-600 hover:bg-slate-50 text-sm cursor-pointer"
                                                        onClick={() => handleDropdownSelect("ID")}
                                                    >
                                                        ID
                                                    </li>
                                                    <li
                                                        className="px-4 py-2 text-slate-600 hover:bg-slate-50 text-sm cursor-pointer"
                                                        onClick={() => handleDropdownSelect("Name")}
                                                    >
                                                        Name
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                        <input
                                            ref={inputRef}
                                            type="text"
                                            value={searchValue}
                                            onChange={handleSearchInput}
                                            className="w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md pr-12 pl-28 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow"
                                            placeholder={searchType === "ID" ? "Enter teacher ID..." : "Enter teacher name..."}
                                        />
                                        <button
                                            className="absolute right-1 top-1 rounded bg-slate-800 p-1.5 border border-transparent text-center text-sm text-white transition-all shadow-sm hover:shadow focus:bg-slate-700 focus:shadow-none active:bg-slate-700 hover:bg-slate-700 active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                                            type="submit"
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 16 16"
                                                fill="currentColor"
                                                className="w-4 h-4"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </form>
                            {/* Create new Teacher button */}
                            <div>
                                <button
                                    onClick={handleCreate}
                                    className={`flex items-center mt-1 p-2 rounded-lg text-black group bg-white`}
                                >
                                    <IoCreateOutline className={`w-5 h-5 transition duration-75`} />
                                    <span className="flex-1 ms-3 whitespace-nowrap">Create</span>
                                </button>
                            </div>
                        </div>
                    }
                </div>
            </div>
            {/* From for creating new teacher */}
            {isCreating &&
                <div className='relative'>
                    <div className='p-10 m-10 bg-white rounded-2xl shadow-2xl'>
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
                                            ref={inputProfileImageRef}

                                        />
                                        <button
                                            onClick={() => inputProfileImageRef.current?.click()}
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
                                                ref={inputSignautreImageRef}

                                            />
                                            <div className='flex items-center gap-x-4'>
                                                <div className='h-10 w-[10rem] rounded'>
                                                    <img className='w-full h-full object-cover' src={`${previewSignatureImage ? previewSignatureImage : ''}`} alt="" />
                                                </div>
                                                <button
                                                    onClick={() => inputSignautreImageRef.current?.click()}
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
                                        className="bg-blue-600 text-white px-10 py-2 rounded hover:bg-blue-700 transition"
                                    >
                                        Submit
                                    </button>
                                </div>
                            </div>

                        </form>
                    </div>
                    {/* Creating from close button */}
                    <div className='relative left-[83rem] bottom-[51rem]'>
                        <button onClick={() => setIsCreating(false)}>
                            <MdCancel className='text-2xl' />
                        </button>
                    </div>
                    {/* Teacher Creting Loading */}
                    {
                        createTeacherLoading &&
                        <div className='absolute top-1/2 right-1/2 -translate-1/2'>
                            <Lottie animationData={loadingLottie} loop={true} />
                        </div>
                    }
                </div>
            }
            {/* ------- Displaying Teacher List ------- */}
            <div className='mt-10 px-4'>
                {/* When there is no teacher */}
                {
                    fullTeacherData?.length == 0 && !fullTeacherError && !fullTeacherLoading &&
                    <div className=' w-full min-h-[35rem] flex items-center justify-center'>
                        <h1 className='text-2xl text-gray-400/95'>No teacher found!</h1>
                    </div>
                }
                {/* When teacher is loading */}
                {
                    !fullTeacherError && fullTeacherLoading &&
                    <div className=' w-full min-h-[35rem] flex items-center justify-center'>
                        <Lottie animationData={loadingLottie} loop={true} />
                    </div>
                }
                {/* When there is teacher */}
                {
                    fullTeacherData?.length > 0 && !fullTeacherError && !fullTeacherLoading &&
                    <div className='grid grid-cols-3 gap-6'>
                        {
                            fullTeacherData?.map(teacherData => (
                                <EachDashTeacher key={teacherData.id} teacherData={teacherData} featchFullTeacherData = {featchFullTeacherData} />
                            ))
                        }
                    </div>
                }
            </div>
        </div>
    );
};

export default DashTeacherComponent;
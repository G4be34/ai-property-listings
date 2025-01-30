import axios from "axios";
import { useState } from "react";
import { MdClose } from "react-icons/md";
import "./RequestModal.css";

export default function RequestModal({ setShowModal }: { setShowModal: React.Dispatch<React.SetStateAction<boolean>> }) {
  const [isLoading, setIsLoading] = useState(false);

  const closeModal = () => {
    setShowModal(false);
  };

  const submitPhoneNumber = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const phoneNumber = formData.get('phoneNumber') as string;

      axios.post('/api/sendEmail', { phone: phoneNumber });

      setIsLoading(false);
      setShowModal(false);
    } catch (error) {
      console.log("Error submitting phone number:", error);
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-container">
      <div className="modal-background" onClick={closeModal}></div>
      <dialog className="modal-body" open>
        <button type="button" className="close-button" onClick={closeModal}><MdClose size={15} /></button>
        <p className="request-modal-title">We will go and visit this property for you!</p>
        <p className="request-modal-title">We take photos, videos, write a report, and even tour the neighborhood for you!</p>
        <form className="request-modal-form" onSubmit={submitPhoneNumber}>
          <small className="request-modal-input-label">Your Phone Number</small>
          <div className="request-modal-input-container">
            <input type="text" className="request-modal-input" placeholder="Enter your number" name="phoneNumber" />
            <button type="submit" className="request-modal-button" disabled={isLoading}>{isLoading ? "Submitting..." : "Submit"}</button>
          </div>
        </form>
      </dialog>
    </div>
  )
};
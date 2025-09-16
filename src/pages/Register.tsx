import { RegistrationStepper } from "@/components/registration/RegistrationStepper";

export default function Register() {
  // Keep the success screen visible; navigation will happen after user verifies and signs in
  return <RegistrationStepper />;
}
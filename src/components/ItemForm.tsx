// import { useState } from "react";
// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// // Simulated API calls
// const fetchItem = async (id: string) => ({
//   id,
//   name: "Existing Item",
//   description: "Loaded from DB",
// });
// const createItem = async (data: any) => ({
//   id: Math.random().toString(),
//   ...data,
// });
// const updateItem = async (id: string, data: any) => ({ id, ...data });

// const DEFAULTS = {
//   name: "",
//   description: "",
// };

// export default function ItemForm({
//   id,
//   onSave,
// }: {
//   id?: string;
//   onSave: (item: any) => void;
// }) {
//   const queryClient = useQueryClient();

//   // Fetch existing item (only if editing)
//   const {
//     data: formData,
//     isLoading,
//     error,
//   } = useQuery({
//     queryKey: ["item", id],
//     queryFn: () => (id ? fetchItem(id) : DEFAULTS),
//     enabled: !!id, // Only fetch if an ID exists (editing)
//     initialData: DEFAULTS, // Ensure form starts with default values
//   });

//   // Create mutation
//   const createMutation = useMutation({
//     mutationFn: createItem,
//     onSuccess: (newItem) => {
//       queryClient.invalidateQueries(["items"]); // Refresh list
//       onSave(newItem); // Return saved item with new ID
//     },
//   });

//   // Update mutation
//   const updateMutation = useMutation({
//     mutationFn: ({ id, data }: { id: string; data: any }) =>
//       updateItem(id, data),
//     onSuccess: (updatedItem) => {
//       queryClient.invalidateQueries(["item", id]);
//       onSave(updatedItem);
//     },
//   });

//   const handleChange = (
//     e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
//   ) => {
//     queryClient.setQueryData(["item", id], (prev: any) => ({
//       ...prev,
//       [e.target.name]: e.target.value,
//     }));
//   };

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (id) {
//       updateMutation.mutate({ id, data: formData });
//     } else {
//       createMutation.mutate(formData);
//     }
//   };

//   if (isLoading) return <p>Loading...</p>;
//   if (error) return <p>Failed to load item</p>;

//   return (
//     <form onSubmit={handleSubmit}>
//       <input
//         name="name"
//         value={formData.name}
//         onChange={handleChange}
//         placeholder="Name"
//         required
//       />
//       <textarea
//         name="description"
//         value={formData.description}
//         onChange={handleChange}
//         placeholder="Description"
//       />
//       <button
//         type="submit"
//         disabled={createMutation.isLoading || updateMutation.isLoading}
//       >
//         {id ? "Update" : "Create"}
//       </button>
//     </form>
//   );
// }

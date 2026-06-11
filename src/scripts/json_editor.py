import customtkinter as ctk
from tkinter import filedialog, messagebox
import json
import os
import shutil
from PIL import Image

# --- CONFIGURATION ---
ASSETS_PATH = r"D:\WEBSITE\q-asoon\src\assets"
DATA_PATH = r"D:\WEBSITE\q-asoon\src\data\post_demo.json"

ctk.set_appearance_mode("Dark")
ctk.set_default_color_theme("blue")

class ProQuoraEditor(ctk.CTk):
    def __init__(self):
        super().__init__()

        self.title("Quora Creator Studio Ultra - Enterprise Edition")
        self.geometry("1300x950")

        self.posts = []
        self.current_index = None
        self.avatar_filename = ""
        self.images_list = []
        
        self.load_data()
        self.setup_ui()

    def load_data(self):
        if not os.path.exists(os.path.dirname(DATA_PATH)):
            os.makedirs(os.path.dirname(DATA_PATH))
        if os.path.exists(DATA_PATH):
            try:
                with open(DATA_PATH, 'r', encoding='utf-8') as f:
                    self.posts = json.load(f)
            except: self.posts = []

    def setup_ui(self):
        self.grid_columnconfigure(1, weight=1)
        self.grid_rowconfigure(0, weight=1)

        # --- SIDEBAR ---
        self.sidebar = ctk.CTkFrame(self, width=300, corner_radius=0, fg_color="#1a1a1b")
        self.sidebar.grid(row=0, column=0, sticky="nsew")
        
        ctk.CTkLabel(self.sidebar, text="QUORA STUDIO", font=("Trebuchet MS", 26, "bold"), text_color="#cb4335").pack(pady=30)
        
        self.post_listbox = ctk.CTkScrollableFrame(self.sidebar, label_text="Database Posts", fg_color="transparent")
        self.post_listbox.pack(fill="both", expand=True, padx=15, pady=10)
        
        ctk.CTkButton(self.sidebar, text="+ NEW POST", fg_color="#cb4335", hover_color="#a83226", height=45, font=("Arial", 14, "bold"), command=self.clear_fields).pack(pady=20, padx=25, fill="x")

        # --- MAIN WORKSPACE ---
        self.workspace = ctk.CTkScrollableFrame(self, fg_color="#121212", corner_radius=0)
        self.workspace.grid(row=0, column=1, sticky="nsew")

        # CARD 1: USER VERIFICATION
        self.card_user = ctk.CTkFrame(self.workspace, fg_color="#1e1e1e")
        self.card_user.pack(fill="x", padx=20, pady=15)
        
        self.ava_preview = ctk.CTkLabel(self.card_user, text="", width=100, height=100, corner_radius=50)
        self.ava_preview.grid(row=0, column=0, rowspan=3, padx=20, pady=20)
        
        self.ava_status_icon = ctk.CTkLabel(self.card_user, text="❌ Missing", text_color="#e74c3c", font=("Arial", 12, "bold"))
        self.ava_status_icon.grid(row=3, column=0)

        self.name_ent = self.create_input(self.card_user, "Author Name", 0, 1)
        self.role_ent = self.create_input(self.card_user, "Role / Expertise", 1, 1)
        ctk.CTkButton(self.card_user, text="Upload Avatar", width=120, command=self.pick_avatar).grid(row=0, column=2, padx=20)

        # CARD 2: POST CONTENT
        self.card_content = ctk.CTkFrame(self.workspace, fg_color="#1e1e1e")
        self.card_content.pack(fill="x", padx=20, pady=10)
        
        ctk.CTkLabel(self.card_content, text="Heading / Main Question", font=("Arial", 13, "bold")).pack(anchor="w", padx=20, pady=(15,0))
        self.heading_ent = ctk.CTkEntry(self.card_content, placeholder_text="Title...", height=40, fg_color="#2b2b2b")
        self.heading_ent.pack(fill="x", padx=20, pady=10)
        
        ctk.CTkLabel(self.card_content, text="Description Body", font=("Arial", 13, "bold")).pack(anchor="w", padx=20)
        self.desc_txt = ctk.CTkTextbox(self.card_content, height=180, fg_color="#2b2b2b")
        self.desc_txt.pack(fill="x", padx=20, pady=10)

        # CARD 3: STATS & SETTINGS
        self.card_stats = ctk.CTkFrame(self.workspace, fg_color="#1e1e1e")
        self.card_stats.pack(fill="x", padx=20, pady=10)
        
        stats_grid = ctk.CTkFrame(self.card_stats, fg_color="transparent")
        stats_grid.pack(side="left", padx=10, pady=10)
        
        self.up_ent = self.create_mini_stat(stats_grid, "Upvotes")
        self.cm_ent = self.create_mini_stat(stats_grid, "Comments")
        self.sh_ent = self.create_mini_stat(stats_grid, "Shares")
        
        self.follow_sw = ctk.CTkSwitch(self.card_stats, text="Show Follow Button", progress_color="#cb4335")
        self.follow_sw.pack(side="right", padx=30)

        # CARD 4: ADVANCED GALLERY VERIFIER
        self.card_gallery = ctk.CTkFrame(self.workspace, fg_color="#1e1e1e")
        self.card_gallery.pack(fill="x", padx=20, pady=10)
        
        gall_header = ctk.CTkFrame(self.card_gallery, fg_color="transparent")
        gall_header.pack(fill="x", padx=20, pady=10)
        ctk.CTkLabel(gall_header, text="GALLERY ASSETS", font=("Arial", 15, "bold")).pack(side="left")
        self.gall_count = ctk.CTkLabel(gall_header, text="0 Items", text_color="#aaa")
        self.gall_count.pack(side="left", padx=20)
        
        self.thumb_box = ctk.CTkScrollableFrame(self.card_gallery, height=150, orientation="horizontal", fg_color="#121212")
        self.thumb_box.pack(fill="x", padx=20, pady=10)
        
        gall_btns = ctk.CTkFrame(self.card_gallery, fg_color="transparent")
        gall_btns.pack(fill="x", padx=20, pady=5)
        ctk.CTkButton(gall_btns, text="+ Add Images", width=140, command=self.pick_images).pack(side="left", padx=5)
        ctk.CTkButton(gall_btns, text="Clear All", width=100, fg_color="#444", command=self.clear_gallery).pack(side="left")

        # FOOTER
        self.save_btn = ctk.CTkButton(self.workspace, text="VERIFY & SAVE TO DATABASE", height=60, font=("Arial", 18, "bold"), fg_color="#cb4335", hover_color="#ff4b2b", command=self.save_post)
        self.save_btn.pack(fill="x", padx=20, pady=30)
        
        self.del_btn = ctk.CTkButton(self.workspace, text="Delete Selected Post", fg_color="transparent", border_width=1, border_color="#444", command=self.delete_post)
        self.del_btn.pack(pady=10)

        self.refresh_list()
        self.verify_assets()

    def create_input(self, parent, label, row, col):
        f = ctk.CTkFrame(parent, fg_color="transparent")
        f.grid(row=row, column=col, sticky="we", padx=10)
        ctk.CTkLabel(f, text=label, font=("Arial", 11)).pack(anchor="w")
        e = ctk.CTkEntry(f, width=350, height=35, fg_color="#2b2b2b")
        e.pack(fill="x")
        return e

    def create_mini_stat(self, parent, label):
        f = ctk.CTkFrame(parent, fg_color="transparent")
        f.pack(side="left", padx=10)
        ctk.CTkLabel(f, text=label).pack()
        e = ctk.CTkEntry(f, width=80)
        e.pack()
        return e

    # --- ASSET VERIFICATION ---
    def verify_assets(self):
        # 1. Verify Avatar
        ava_path = os.path.join(ASSETS_PATH, self.avatar_filename)
        if self.avatar_filename and os.path.exists(ava_path):
            img = ctk.CTkImage(Image.open(ava_path), size=(100, 100))
            self.ava_status_icon.configure(text="✅ Found", text_color="#2ecc71")
        else:
            img = ctk.CTkImage(Image.new('RGB', (100, 100), (40, 40, 40)), size=(100, 100))
            self.ava_status_icon.configure(text="❌ Missing", text_color="#e74c3c")
        self.ava_preview.configure(image=img)

        # 2. Verify Gallery
        for w in self.thumb_box.winfo_children(): w.destroy()
        self.gall_count.configure(text=f"{len(self.images_list)} Assets Total")
        
        for i, name in enumerate(self.images_list):
            p = os.path.join(ASSETS_PATH, name)
            f = ctk.CTkFrame(self.thumb_box, fg_color="transparent")
            f.grid(row=0, column=i, padx=10)
            
            if os.path.exists(p):
                img = ctk.CTkImage(Image.open(p), size=(120, 80))
                status = "✅"
                color = "#2ecc71"
            else:
                img = ctk.CTkImage(Image.new('RGB', (120, 80), (60, 20, 20)), size=(120, 80))
                status = "❌"
                color = "#e74c3c"
            
            ctk.CTkLabel(f, image=img, text="").pack()
            ctk.CTkLabel(f, text=f"{status} {name[:10]}", font=("Arial", 10), text_color=color).pack()

    # --- ACTIONS ---
    def pick_avatar(self):
        p = filedialog.askopenfilename()
        if p:
            self.avatar_filename = os.path.basename(p)
            shutil.copy(p, os.path.join(ASSETS_PATH, self.avatar_filename))
            self.verify_assets()

    def pick_images(self):
        ps = filedialog.askopenfilenames()
        for p in ps:
            fname = os.path.basename(p)
            shutil.copy(p, os.path.join(ASSETS_PATH, fname))
            if fname not in self.images_list: self.images_list.append(fname)
        self.verify_assets()

    def clear_gallery(self):
        self.images_list = []
        self.verify_assets()

    def save_post(self):
        data = {
            "avatar": self.avatar_filename,
            "name": self.name_ent.get(),
            "follow_enabled": self.follow_sw.get(),
            "role_name": self.role_ent.get(),
            "updated_time": "6y",
            "heading": self.heading_ent.get(),
            "description": self.desc_txt.get("1.0", "end-1c"),
            "images": self.images_list,
            "extra_images_count": len(self.images_list),
            "upvotes": int(self.up_ent.get() or 0),
            "comments": int(self.cm_ent.get() or 0),
            "shares": int(self.sh_ent.get() or 0)
        }
        if self.current_index is not None: self.posts[self.current_index] = data
        else: self.posts.append(data)
        
        with open(DATA_PATH, 'w', encoding='utf-8') as f: json.dump(self.posts, f, indent=4)
        messagebox.showinfo("Database Update", "Post verified and saved successfully!")
        self.refresh_list()

    def load_post(self, idx):
        self.current_index = idx
        p = self.posts[idx]
        self.name_ent.delete(0, "end"); self.name_ent.insert(0, p.get('name', ''))
        self.role_ent.delete(0, "end"); self.role_ent.insert(0, p.get('role_name', ''))
        self.heading_ent.delete(0, "end"); self.heading_ent.insert(0, p.get('heading', ''))
        self.up_ent.delete(0, "end"); self.up_ent.insert(0, str(p.get('upvotes', 0)))
        self.cm_ent.delete(0, "end"); self.cm_ent.insert(0, str(p.get('comments', 0)))
        self.sh_ent.delete(0, "end"); self.sh_ent.insert(0, str(p.get('shares', 0)))
        self.desc_txt.delete("1.0", "end"); self.desc_txt.insert("1.0", p.get('description', ''))
        self.follow_sw.select() if p.get('follow_enabled') else self.follow_sw.deselect()
        self.avatar_filename = p.get('avatar', '')
        self.images_list = p.get('images', [])
        self.verify_assets()

    def clear_fields(self):
        self.current_index = None
        self.name_ent.delete(0, "end"); self.role_ent.delete(0, "end")
        self.heading_ent.delete(0, "end"); self.desc_txt.delete("1.0", "end")
        self.up_ent.delete(0, "end"); self.cm_ent.delete(0, "end"); self.sh_ent.delete(0, "end")
        self.avatar_filename = ""; self.images_list = []
        self.verify_assets()

    def refresh_list(self):
        for w in self.post_listbox.winfo_children(): w.destroy()
        for i, p in enumerate(self.posts):
            title = p.get('heading', 'Untitled')[:25]
            ctk.CTkButton(self.post_listbox, text=f"• {title}", fg_color="transparent", anchor="w", 
                          hover_color="#2b2b2b", command=lambda x=i: self.load_post(x)).pack(fill="x", pady=2)

    def delete_post(self):
        if self.current_index is not None:
            self.posts.pop(self.current_index)
            with open(DATA_PATH, 'w', encoding='utf-8') as f: json.dump(self.posts, f, indent=4)
            self.clear_fields(); self.refresh_list()

if __name__ == "__main__":
    app = ProQuoraEditor()
    app.mainloop()